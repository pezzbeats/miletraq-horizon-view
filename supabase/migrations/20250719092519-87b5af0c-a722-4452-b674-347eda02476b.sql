-- Fix the get_user_accessible_subsidiaries function to handle JSONB properly
CREATE OR REPLACE FUNCTION public.get_user_accessible_subsidiaries()
 RETURNS uuid[]
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  subsidiary_list uuid[];
BEGIN
  -- Convert JSONB array to UUID array
  SELECT ARRAY(
    SELECT (value#>>'{}')::uuid 
    FROM jsonb_array_elements(COALESCE(subsidiary_access, '[]'::jsonb))
  )
  INTO subsidiary_list
  FROM public.profiles
  WHERE user_id = auth.uid();
  
  RETURN COALESCE(subsidiary_list, ARRAY[]::uuid[]);
END;
$function$