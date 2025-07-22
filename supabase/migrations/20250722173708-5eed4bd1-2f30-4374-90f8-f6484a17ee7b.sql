-- Step 1: Create user-subsidiary relationship model with permission levels

-- Create permission level enum
CREATE TYPE subsidiary_permission_level AS ENUM (
  'full_access',
  'operational_access', 
  'read_only_access',
  'fuel_only_access',
  'maintenance_only_access'
);

-- Create user_subsidiary_permissions table for many-to-many relationship
CREATE TABLE public.user_subsidiary_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subsidiary_id UUID NOT NULL REFERENCES public.subsidiaries(id) ON DELETE CASCADE,
  permission_level subsidiary_permission_level NOT NULL DEFAULT 'read_only_access',
  assigned_by UUID REFERENCES public.profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, subsidiary_id)
);

-- Enable RLS
ALTER TABLE public.user_subsidiary_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_subsidiary_permissions
CREATE POLICY "Super admins can manage all user subsidiary permissions" 
ON public.user_subsidiary_permissions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_super_admin = true
  )
);

CREATE POLICY "Users can view their own subsidiary permissions" 
ON public.user_subsidiary_permissions 
FOR SELECT 
USING (
  user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Admins can manage permissions for their subsidiaries
CREATE POLICY "Subsidiary admins can manage permissions for their subsidiaries" 
ON public.user_subsidiary_permissions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_subsidiary_permissions usp ON p.id = usp.user_id
    WHERE p.user_id = auth.uid() 
    AND usp.subsidiary_id = user_subsidiary_permissions.subsidiary_id
    AND usp.permission_level IN ('full_access', 'operational_access')
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_user_subsidiary_permissions_updated_at
BEFORE UPDATE ON public.user_subsidiary_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing data from profiles.subsidiary_access to new table
INSERT INTO public.user_subsidiary_permissions (user_id, subsidiary_id, permission_level, assigned_at)
SELECT 
  p.id,
  sub_id::uuid,
  CASE 
    WHEN p.is_super_admin = true THEN 'full_access'::subsidiary_permission_level
    WHEN p.role = 'admin' THEN 'full_access'::subsidiary_permission_level
    WHEN p.role = 'manager' THEN 'operational_access'::subsidiary_permission_level
    WHEN p.role = 'fuel_manager' THEN 'fuel_only_access'::subsidiary_permission_level
    ELSE 'read_only_access'::subsidiary_permission_level
  END,
  p.created_at
FROM public.profiles p
CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(p.subsidiary_access, '[]'::jsonb)) AS sub_id
WHERE p.subsidiary_access IS NOT NULL AND p.subsidiary_access != '[]'::jsonb;

-- Update helper functions to use new permission system
CREATE OR REPLACE FUNCTION public.get_user_accessible_subsidiaries()
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subsidiary_list uuid[];
BEGIN
  -- Get subsidiaries from new permission table
  SELECT ARRAY(
    SELECT usp.subsidiary_id 
    FROM public.user_subsidiary_permissions usp
    JOIN public.profiles p ON usp.user_id = p.id
    WHERE p.user_id = auth.uid()
  )
  INTO subsidiary_list;
  
  RETURN COALESCE(subsidiary_list, ARRAY[]::uuid[]);
END;
$$;

-- Create function to check specific permission level
CREATE OR REPLACE FUNCTION public.user_has_subsidiary_permission(
  target_subsidiary_id uuid,
  required_permission subsidiary_permission_level
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_permission subsidiary_permission_level;
  permission_hierarchy integer;
  required_hierarchy integer;
BEGIN
  -- Get user's permission level for the subsidiary
  SELECT usp.permission_level
  INTO user_permission
  FROM public.user_subsidiary_permissions usp
  JOIN public.profiles p ON usp.user_id = p.id
  WHERE p.user_id = auth.uid() 
  AND usp.subsidiary_id = target_subsidiary_id;
  
  -- If no permission found, check if super admin
  IF user_permission IS NULL THEN
    RETURN (SELECT COALESCE(is_super_admin, false) FROM public.profiles WHERE user_id = auth.uid());
  END IF;
  
  -- Define permission hierarchy (higher number = more permissions)
  permission_hierarchy := CASE user_permission
    WHEN 'full_access' THEN 5
    WHEN 'operational_access' THEN 4
    WHEN 'maintenance_only_access' THEN 3
    WHEN 'fuel_only_access' THEN 2
    WHEN 'read_only_access' THEN 1
  END;
  
  required_hierarchy := CASE required_permission
    WHEN 'full_access' THEN 5
    WHEN 'operational_access' THEN 4
    WHEN 'maintenance_only_access' THEN 3
    WHEN 'fuel_only_access' THEN 2
    WHEN 'read_only_access' THEN 1
  END;
  
  RETURN permission_hierarchy >= required_hierarchy;
END;
$$;

-- Create function to get user's default subsidiary with better logic
CREATE OR REPLACE FUNCTION public.get_user_default_subsidiary()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  default_sub uuid;
BEGIN
  -- First try the explicit default from profiles
  SELECT default_subsidiary_id
  INTO default_sub
  FROM public.profiles
  WHERE user_id = auth.uid() AND default_subsidiary_id IS NOT NULL;
  
  -- If no explicit default, get the first subsidiary with highest permission
  IF default_sub IS NULL THEN
    SELECT usp.subsidiary_id
    INTO default_sub
    FROM public.user_subsidiary_permissions usp
    JOIN public.profiles p ON usp.user_id = p.id
    WHERE p.user_id = auth.uid()
    ORDER BY 
      CASE usp.permission_level
        WHEN 'full_access' THEN 5
        WHEN 'operational_access' THEN 4
        WHEN 'maintenance_only_access' THEN 3
        WHEN 'fuel_only_access' THEN 2
        WHEN 'read_only_access' THEN 1
      END DESC,
      usp.assigned_at ASC
    LIMIT 1;
  END IF;
  
  RETURN default_sub;
END;
$$;