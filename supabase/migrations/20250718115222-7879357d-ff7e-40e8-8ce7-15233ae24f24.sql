-- Add business logic triggers and functions for MileTraq

-- Function to auto-update tank level when fuel is purchased
CREATE OR REPLACE FUNCTION update_tank_on_fuel_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the fuel tank current level
  UPDATE fuel_tank 
  SET current_level = current_level + NEW.volume,
      last_updated = NOW(),
      updated_by = NEW.created_by
  WHERE id = (SELECT id FROM fuel_tank LIMIT 1);
  
  -- If no tank exists, create one
  IF NOT FOUND THEN
    INSERT INTO fuel_tank (current_level, capacity, updated_by)
    VALUES (NEW.volume, 10000, NEW.created_by);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update tank level when fuel is consumed from internal tank
CREATE OR REPLACE FUNCTION update_tank_on_fuel_consumption()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if fuel source is internal tank
  IF NEW.fuel_source = 'internal_tank' THEN
    UPDATE fuel_tank 
    SET current_level = current_level - NEW.fuel_volume,
        last_updated = NOW(),
        updated_by = NEW.created_by
    WHERE id = (SELECT id FROM fuel_tank LIMIT 1);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate mileage automatically
CREATE OR REPLACE FUNCTION calculate_mileage()
RETURNS TRIGGER AS $$
DECLARE
  prev_reading INTEGER;
  km_driven INTEGER;
  calculated_mileage NUMERIC;
BEGIN
  -- Get previous odometer reading for this vehicle
  SELECT odometer_reading INTO prev_reading 
  FROM fuel_log 
  WHERE vehicle_id = NEW.vehicle_id 
    AND date < NEW.date 
  ORDER BY date DESC, created_at DESC 
  LIMIT 1;
  
  -- If no previous reading, try odometer_readings table
  IF prev_reading IS NULL THEN
    SELECT odometer_reading INTO prev_reading
    FROM odometer_readings
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
$$ LANGUAGE plpgsql;

-- Function to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'viewer'::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS fuel_purchase_tank_update ON fuel_purchases;
CREATE TRIGGER fuel_purchase_tank_update
  AFTER INSERT ON fuel_purchases
  FOR EACH ROW EXECUTE FUNCTION update_tank_on_fuel_purchase();

DROP TRIGGER IF EXISTS fuel_consumption_tank_update ON fuel_log;
CREATE TRIGGER fuel_consumption_tank_update
  AFTER INSERT ON fuel_log
  FOR EACH ROW EXECUTE FUNCTION update_tank_on_fuel_consumption();

DROP TRIGGER IF EXISTS calculate_mileage_trigger ON fuel_log;
CREATE TRIGGER calculate_mileage_trigger
  BEFORE INSERT ON fuel_log
  FOR EACH ROW EXECUTE FUNCTION calculate_mileage();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Initialize fuel tank (if not exists)
INSERT INTO fuel_tank (capacity, current_level, updated_by) 
SELECT 10000, 5000, '00000000-0000-0000-0000-000000000000'::UUID
WHERE NOT EXISTS (SELECT 1 FROM fuel_tank);