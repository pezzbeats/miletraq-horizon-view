-- Step 4: Create helper functions and update RLS policies
-- Create subsidiary context functions
CREATE OR REPLACE FUNCTION public.get_user_accessible_subsidiaries()
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subsidiary_list uuid[];
BEGIN
  SELECT COALESCE(subsidiary_access::uuid[], ARRAY[]::uuid[])
  INTO subsidiary_list
  FROM public.profiles
  WHERE user_id = auth.uid();
  
  RETURN subsidiary_list;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_default_subsidiary()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  default_sub uuid;
BEGIN
  SELECT default_subsidiary_id
  INTO default_sub
  FROM public.profiles
  WHERE user_id = auth.uid();
  
  RETURN default_sub;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_user_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_super boolean;
BEGIN
  SELECT COALESCE(is_super_admin, false)
  INTO is_super
  FROM public.profiles
  WHERE user_id = auth.uid();
  
  RETURN is_super;
END;
$$;

-- Create policies for subsidiaries
CREATE POLICY "Users can view subsidiaries they have access to" 
ON public.subsidiaries 
FOR SELECT 
USING (
  id = ANY(public.get_user_accessible_subsidiaries()) OR
  public.is_user_super_admin()
);

CREATE POLICY "Super admins can manage subsidiaries" 
ON public.subsidiaries 
FOR ALL 
USING (public.is_user_super_admin());