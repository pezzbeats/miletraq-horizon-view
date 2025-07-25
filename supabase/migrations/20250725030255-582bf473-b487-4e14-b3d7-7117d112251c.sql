-- Fix the remaining database functions with secure search_path

-- 15. Fix update_tank_on_fuel_purchase function
CREATE OR REPLACE FUNCTION public.update_tank_on_fuel_purchase()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Update the fuel tank current level
  UPDATE public.fuel_tank 
  SET current_level = current_level + NEW.volume,
      last_updated = NOW(),
      updated_by = NEW.created_by
  WHERE id = (SELECT id FROM public.fuel_tank LIMIT 1);
  
  -- If no tank exists, create one
  IF NOT FOUND THEN
    INSERT INTO public.fuel_tank (current_level, capacity, updated_by)
    VALUES (NEW.volume, 10000, NEW.created_by);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 16. Fix update_tank_on_fuel_consumption function
CREATE OR REPLACE FUNCTION public.update_tank_on_fuel_consumption()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Only update if fuel source is internal tank
  IF NEW.fuel_source = 'internal_tank' THEN
    UPDATE public.fuel_tank 
    SET current_level = current_level - NEW.fuel_volume,
        last_updated = NOW(),
        updated_by = NEW.created_by
    WHERE id = (SELECT id FROM public.fuel_tank LIMIT 1);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 17. Fix calculate_mileage function
CREATE OR REPLACE FUNCTION public.calculate_mileage()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  prev_reading INTEGER;
  km_driven INTEGER;
  calculated_mileage NUMERIC;
BEGIN
  -- Get previous odometer reading for this vehicle
  SELECT odometer_reading INTO prev_reading 
  FROM public.fuel_log 
  WHERE vehicle_id = NEW.vehicle_id 
    AND date < NEW.date 
  ORDER BY date DESC, created_at DESC 
  LIMIT 1;
  
  -- If no previous reading, try odometer_readings table
  IF prev_reading IS NULL THEN
    SELECT odometer_reading INTO prev_reading
    FROM public.odometer_readings
    WHERE vehicle_id = NEW.vehicle_id
      AND reading_date <= NEW.date
    ORDER BY reading_date DESC, created_at DESC
    LIMIT 1;
  END IF;
  
  -- Calculate km driven and mileage if we have previous reading
  IF prev_reading IS NOT NULL AND NEW.odometer_reading > prev_reading THEN
    km_driven := NEW.odometer_reading - prev_reading;
    calculated_mileage := km_driven::NUMERIC / NEW.fuel_volume;
    
    NEW.km_driven := km_driven;
    NEW.mileage := calculated_mileage;
    NEW.previous_reading := prev_reading;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 18. Fix calculate_document_status function
CREATE OR REPLACE FUNCTION public.calculate_document_status(expiry_date date)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  IF expiry_date IS NULL THEN
    RETURN 'unknown';
  ELSIF expiry_date < CURRENT_DATE THEN
    RETURN 'expired';
  ELSIF expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN
    RETURN 'expiring_soon';
  ELSIF expiry_date <= CURRENT_DATE + INTERVAL '90 days' THEN
    RETURN 'expiring';
  ELSE
    RETURN 'valid';
  END IF;
END;
$function$;

-- 19. Fix calculate_actual_spending function
CREATE OR REPLACE FUNCTION public.calculate_actual_spending(p_category text, p_start_date date, p_end_date date)
 RETURNS numeric
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  total_spent NUMERIC := 0;
BEGIN
  CASE p_category
    WHEN 'fuel' THEN
      -- Sum from fuel_log and fuel_purchases
      SELECT COALESCE(
        (SELECT SUM(total_cost) FROM public.fuel_log 
         WHERE date BETWEEN p_start_date AND p_end_date),
        0
      ) + COALESCE(
        (SELECT SUM(total_cost) FROM public.fuel_purchases 
         WHERE purchase_date BETWEEN p_start_date AND p_end_date),
        0
      ) INTO total_spent;
      
    WHEN 'maintenance' THEN
      -- Sum from maintenance_log
      SELECT COALESCE(SUM(total_cost), 0) INTO total_spent
      FROM public.maintenance_log 
      WHERE maintenance_date BETWEEN p_start_date AND p_end_date;
      
    WHEN 'parts' THEN
      -- Sum from maintenance_parts_used for the period
      SELECT COALESCE(SUM(mpu.total_cost), 0) INTO total_spent
      FROM public.maintenance_parts_used mpu
      JOIN public.maintenance_log ml ON mpu.maintenance_id = ml.id
      WHERE ml.maintenance_date BETWEEN p_start_date AND p_end_date;
      
    ELSE
      total_spent := 0;
  END CASE;
  
  RETURN total_spent;
END;
$function$;

-- 20. Fix update_budget_calculations function
CREATE OR REPLACE FUNCTION public.update_budget_calculations()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Calculate actual amount
  NEW.actual_amount := public.calculate_actual_spending(
    NEW.category, 
    NEW.period_start, 
    NEW.period_end
  );
  
  -- Calculate remaining amount
  NEW.remaining_amount := NEW.budgeted_amount - NEW.actual_amount;
  
  -- Calculate variance percentage
  IF NEW.budgeted_amount > 0 THEN
    NEW.variance_percentage := ((NEW.actual_amount - NEW.budgeted_amount) / NEW.budgeted_amount) * 100;
  ELSE
    NEW.variance_percentage := 0;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 21. Fix get_setting function
CREATE OR REPLACE FUNCTION public.get_setting(setting_key text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  result JSONB;
BEGIN
  SELECT setting_value INTO result
  FROM public.app_settings
  WHERE app_settings.setting_key = get_setting.setting_key;
  
  RETURN COALESCE(result, 'null'::jsonb);
END;
$function$;

-- 22. Fix update_setting function
CREATE OR REPLACE FUNCTION public.update_setting(setting_key text, setting_value jsonb, user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  UPDATE public.app_settings
  SET 
    setting_value = update_setting.setting_value,
    updated_at = now(),
    updated_by = (SELECT id FROM public.profiles WHERE profiles.user_id = update_setting.user_id)
  WHERE app_settings.setting_key = update_setting.setting_key;
  
  RETURN FOUND;
END;
$function$;