-- Continue fixing remaining database functions with secure search_path

-- 7. Fix user_has_subsidiary_permission function
CREATE OR REPLACE FUNCTION public.user_has_subsidiary_permission(target_subsidiary_id uuid, required_permission public.subsidiary_permission_level)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  user_permission public.subsidiary_permission_level;
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
$function$;

-- 8. Fix get_user_default_subsidiary function
CREATE OR REPLACE FUNCTION public.get_user_default_subsidiary()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- 9. Fix update_fuel_tank_on_purchase function
CREATE OR REPLACE FUNCTION public.update_fuel_tank_on_purchase()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Update the specified fuel tank level
  UPDATE public.fuel_tanks 
  SET 
    current_volume = current_volume + NEW.volume,
    updated_at = now()
  WHERE id = NEW.tank_id;
  
  RETURN NEW;
END;
$function$;

-- 10. Fix update_fuel_tank_on_consumption function
CREATE OR REPLACE FUNCTION public.update_fuel_tank_on_consumption()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  tank_record public.fuel_tanks%ROWTYPE;
BEGIN
  -- Only update if fuel source is internal tank
  IF NEW.fuel_source = 'internal_tank' THEN
    -- Find the appropriate tank for this fuel type and subsidiary
    SELECT * INTO tank_record
    FROM public.fuel_tanks 
    WHERE fuel_type = NEW.fuel_type::public.fuel_type_enum 
      AND subsidiary_id = NEW.subsidiary_id 
      AND is_active = true
    LIMIT 1;
    
    IF FOUND THEN
      UPDATE public.fuel_tanks 
      SET 
        current_volume = current_volume - NEW.fuel_volume,
        updated_at = now()
      WHERE id = tank_record.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 11. Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'viewer'::public.user_role
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error for debugging
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;

-- 12. Fix get_user_accessible_subsidiaries function
CREATE OR REPLACE FUNCTION public.get_user_accessible_subsidiaries()
 RETURNS uuid[]
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- 13. Fix is_user_super_admin function
CREATE OR REPLACE FUNCTION public.is_user_super_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  is_super boolean;
BEGIN
  SELECT COALESCE(is_super_admin, false)
  INTO is_super
  FROM public.profiles
  WHERE user_id = auth.uid();
  
  RETURN is_super;
END;
$function$;

-- 14. Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;