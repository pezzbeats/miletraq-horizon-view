-- Fix all database functions to have secure search_path
-- This prevents schema injection attacks by setting search_path to empty

-- 1. Fix complete_vehicle_transfer function
CREATE OR REPLACE FUNCTION public.complete_vehicle_transfer(transfer_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  transfer_record public.vehicle_transfers%ROWTYPE;
BEGIN
  -- Get the transfer record
  SELECT * INTO transfer_record
  FROM public.vehicle_transfers
  WHERE id = transfer_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update vehicle subsidiary
  UPDATE public.vehicles
  SET 
    subsidiary_id = transfer_record.to_subsidiary_id,
    updated_at = now()
  WHERE id = transfer_record.vehicle_id;
  
  -- Mark transfer as completed
  UPDATE public.vehicle_transfers
  SET 
    status = 'completed',
    completed_at = now(),
    updated_at = now()
  WHERE id = transfer_id;
  
  RETURN TRUE;
END;
$function$;

-- 2. Fix update_tank_on_dispensing function
CREATE OR REPLACE FUNCTION public.update_tank_on_dispensing()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  tank_record public.fuel_tanks%ROWTYPE;
  new_level DECIMAL(10,2);
BEGIN
  -- Only process if fuel source is internal tank and it's diesel
  IF NEW.fuel_source_type = 'internal_tank' AND NEW.fuel_type = 'diesel' THEN
    -- Get the tank record
    SELECT * INTO tank_record
    FROM public.fuel_tanks 
    WHERE id = NEW.internal_tank_id 
      AND fuel_type = 'diesel'
      AND is_active = true;
    
    IF FOUND THEN
      -- Set tank levels in fuel_log
      NEW.tank_level_before := tank_record.current_volume;
      new_level := tank_record.current_volume - NEW.fuel_volume;
      NEW.tank_level_after := new_level;
      
      -- Update tank current volume
      UPDATE public.fuel_tanks 
      SET 
        current_volume = new_level,
        updated_at = now()
      WHERE id = tank_record.id;
      
      -- Insert transaction record
      INSERT INTO public.internal_tank_transactions (
        tank_id,
        transaction_type,
        vehicle_id,
        fuel_log_id,
        quantity,
        unit,
        level_before,
        level_after,
        remarks,
        created_by,
        subsidiary_id
      ) VALUES (
        tank_record.id,
        'dispensed',
        NEW.vehicle_id,
        NEW.id,
        NEW.fuel_volume,
        NEW.unit,
        tank_record.current_volume,
        new_level,
        'Fuel dispensed to vehicle',
        NEW.created_by,
        NEW.subsidiary_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 3. Fix record_tank_purchase function
CREATE OR REPLACE FUNCTION public.record_tank_purchase()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  tank_record public.fuel_tanks%ROWTYPE;
  new_level DECIMAL(10,2);
BEGIN
  -- Get the tank record
  SELECT * INTO tank_record
  FROM public.fuel_tanks 
  WHERE id = NEW.tank_id;
  
  IF FOUND THEN
    -- Calculate new level
    new_level := tank_record.current_volume + NEW.volume;
    
    -- Update tank current volume
    UPDATE public.fuel_tanks 
    SET 
      current_volume = new_level,
      updated_at = now()
    WHERE id = tank_record.id;
    
    -- Insert transaction record
    INSERT INTO public.internal_tank_transactions (
      tank_id,
      transaction_type,
      quantity,
      unit,
      cost_per_unit,
      total_cost,
      vendor_id,
      level_before,
      level_after,
      remarks,
      created_by,
      subsidiary_id
    ) VALUES (
      tank_record.id,
      'purchase',
      NEW.volume,
      NEW.unit,
      NEW.rate_per_liter,
      NEW.total_cost,
      NEW.vendor_id,
      tank_record.current_volume,
      new_level,
      'Tank refill purchase',
      NEW.created_by,
      NEW.subsidiary_id
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 4. Fix generate_ticket_number function
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  next_number INTEGER;
  ticket_number TEXT;
BEGIN
  -- Get the next sequence number for this year
  SELECT COALESCE(MAX(
    CASE 
      WHEN ticket_number ~ '^ST-' || EXTRACT(YEAR FROM NOW()) || '-[0-9]+$' 
      THEN CAST(SPLIT_PART(ticket_number, '-', 3) AS INTEGER)
      ELSE 0
    END
  ), 0) + 1
  INTO next_number
  FROM public.service_tickets;
  
  -- Format: ST-YYYY-NNNN
  ticket_number := 'ST-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(next_number::TEXT, 4, '0');
  
  RETURN ticket_number;
END;
$function$;

-- 5. Fix link_maintenance_to_ticket function
CREATE OR REPLACE FUNCTION public.link_maintenance_to_ticket()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- If maintenance_log is being created and has a service_ticket_id custom field,
  -- update the corresponding service ticket
  IF TG_OP = 'INSERT' AND NEW.description LIKE '%[ST-%' THEN
    -- Extract ticket number from description and update ticket
    UPDATE public.service_tickets 
    SET 
      maintenance_log_id = NEW.id,
      status = 'in_progress',
      work_started_at = COALESCE(work_started_at, NOW()),
      actual_labor_cost = NEW.labor_cost,
      actual_total_cost = NEW.total_cost
    WHERE ticket_number = (
      SELECT SUBSTRING(NEW.description FROM '\[ST-[0-9]{4}-[0-9]{4}\]')
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 6. Fix check_scheduled_maintenance function
CREATE OR REPLACE FUNCTION public.check_scheduled_maintenance()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
DECLARE
  vehicle_record RECORD;
  rule_record RECORD;
  current_mileage INTEGER;
  last_service_date DATE;
  last_service_mileage INTEGER;
  due_by_mileage BOOLEAN;
  due_by_date BOOLEAN;
  should_alert BOOLEAN;
BEGIN
  -- Loop through all active vehicles
  FOR vehicle_record IN 
    SELECT v.* FROM public.vehicles v 
    WHERE v.status = 'active'
  LOOP
    -- Get current mileage from latest fuel log or odometer reading
    SELECT COALESCE(
      (SELECT odometer_reading FROM public.fuel_log 
       WHERE vehicle_id = vehicle_record.id 
       ORDER BY date DESC, created_at DESC LIMIT 1),
      (SELECT odometer_reading FROM public.odometer_readings 
       WHERE vehicle_id = vehicle_record.id 
       ORDER BY reading_date DESC, created_at DESC LIMIT 1),
      0
    ) INTO current_mileage;
    
    -- Loop through applicable maintenance rules
    FOR rule_record IN 
      SELECT mr.* FROM public.maintenance_rules mr 
      WHERE mr.subsidiary_id = vehicle_record.subsidiary_id 
      AND mr.is_active = true
      AND (mr.vehicle_types IS NULL OR vehicle_record.make = ANY(mr.vehicle_types))
    LOOP
      -- Get last service of this type
      SELECT 
        ml.maintenance_date,
        ml.odometer_reading
      INTO last_service_date, last_service_mileage
      FROM public.maintenance_log ml
      WHERE ml.vehicle_id = vehicle_record.id
      AND ml.maintenance_type = rule_record.maintenance_type::public.maintenance_type
      ORDER BY ml.maintenance_date DESC, ml.created_at DESC
      LIMIT 1;
      
      -- Check if due by mileage
      due_by_mileage := false;
      IF rule_record.mileage_interval IS NOT NULL AND last_service_mileage IS NOT NULL THEN
        due_by_mileage := (current_mileage - last_service_mileage) >= rule_record.mileage_interval;
      END IF;
      
      -- Check if due by date
      due_by_date := false;
      IF rule_record.time_interval_days IS NOT NULL AND last_service_date IS NOT NULL THEN
        due_by_date := (CURRENT_DATE - last_service_date) >= rule_record.time_interval_days;
      END IF;
      
      -- Determine if should alert based on rule logic
      should_alert := false;
      IF rule_record.rule_logic = 'OR' THEN
        should_alert := due_by_mileage OR due_by_date;
      ELSE -- 'AND'
        should_alert := due_by_mileage AND due_by_date;
      END IF;
      
      -- Create alert if needed and doesn't already exist
      IF should_alert THEN
        INSERT INTO public.scheduled_maintenance_alerts (
          vehicle_id,
          maintenance_rule_id,
          subsidiary_id,
          alert_type,
          due_date,
          due_mileage,
          current_mileage,
          days_remaining,
          km_remaining
        )
        SELECT 
          vehicle_record.id,
          rule_record.id,
          vehicle_record.subsidiary_id,
          CASE 
            WHEN (CURRENT_DATE - COALESCE(last_service_date, CURRENT_DATE)) > rule_record.time_interval_days THEN 'overdue'
            ELSE 'due'
          END,
          COALESCE(last_service_date, CURRENT_DATE) + rule_record.time_interval_days,
          COALESCE(last_service_mileage, 0) + rule_record.mileage_interval,
          current_mileage,
          GREATEST(0, rule_record.time_interval_days - (CURRENT_DATE - COALESCE(last_service_date, CURRENT_DATE))),
          GREATEST(0, rule_record.mileage_interval - (current_mileage - COALESCE(last_service_mileage, 0)))
        WHERE NOT EXISTS (
          SELECT 1 FROM public.scheduled_maintenance_alerts sma
          WHERE sma.vehicle_id = vehicle_record.id
          AND sma.maintenance_rule_id = rule_record.id
          AND sma.is_acknowledged = false
        );
      END IF;
    END LOOP;
  END LOOP;
END;
$function$;