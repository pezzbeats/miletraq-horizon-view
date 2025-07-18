-- Add business logic triggers and functions

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

-- Get a system user ID for sample data (use auth service role)
DO $$
DECLARE
  system_user_id UUID := '00000000-0000-0000-0000-000000000000'::UUID;
BEGIN
  -- Insert sample data with proper UUID casting

  -- Sample maintenance categories
  INSERT INTO maintenance_categories (name, description, created_by) VALUES
  ('Engine', 'Engine related parts and maintenance', system_user_id),
  ('Brake', 'Brake system components', system_user_id),
  ('Tyre', 'Tyres and wheel related', system_user_id),
  ('Electrical', 'Electrical system components', system_user_id),
  ('Body', 'Body work and exterior', system_user_id),
  ('Transmission', 'Gearbox and transmission', system_user_id),
  ('Suspension', 'Suspension and steering', system_user_id),
  ('Cooling', 'Radiator and cooling system', system_user_id),
  ('Fuel System', 'Fuel injection and filters', system_user_id),
  ('Exhaust', 'Exhaust system components', system_user_id)
  ON CONFLICT (name) DO NOTHING;

  -- Sample vendors
  INSERT INTO vendors (name, vendor_type, contact_person, phone, email, address, created_by) VALUES
  ('Shell Fuel Station', '{"fuel"}', 'Rajesh Kumar', '+91-9876543210', 'rajesh@shell.com', 'MG Road, Bangalore', system_user_id),
  ('HP Petrol Pump', '{"fuel"}', 'Suresh Patel', '+91-9876543211', 'suresh@hp.com', 'Ring Road, Bangalore', system_user_id),
  ('Bosch Auto Parts', '{"parts"}', 'Amit Singh', '+91-9876543212', 'amit@bosch.com', 'Industrial Area, Bangalore', system_user_id),
  ('TVS Motor Service', '{"parts","maintenance"}', 'Prakash Reddy', '+91-9876543213', 'prakash@tvs.com', 'Service Road, Bangalore', system_user_id),
  ('Mahindra Service Center', '{"parts","maintenance"}', 'Ravi Sharma', '+91-9876543214', 'ravi@mahindra.com', 'Main Road, Bangalore', system_user_id),
  ('Indian Oil Depot', '{"fuel"}', 'Mohan Das', '+91-9876543215', 'mohan@iocl.com', 'Oil Depot Road, Bangalore', system_user_id),
  ('Genuine Parts Store', '{"parts"}', 'Kiran Kumar', '+91-9876543216', 'kiran@parts.com', 'Spare Parts Market, Bangalore', system_user_id),
  ('Auto Care Center', '{"parts","maintenance"}', 'Deepak Joshi', '+91-9876543217', 'deepak@autocare.com', 'Service Lane, Bangalore', system_user_id)
  ON CONFLICT (name) DO NOTHING;

  -- Sample drivers
  INSERT INTO drivers (name, license_number, license_expiry, phone, address, created_by) VALUES
  ('Ramesh Kumar', 'KA0120230001', '2025-06-15', '+91-9876543201', 'JP Nagar, Bangalore', system_user_id),
  ('Suresh Patel', 'KA0120230002', '2025-08-20', '+91-9876543202', 'Koramangala, Bangalore', system_user_id),
  ('Vijay Singh', 'KA0120230003', '2025-03-10', '+91-9876543203', 'Whitefield, Bangalore', system_user_id),
  ('Manjunath Reddy', 'KA0120230004', '2025-12-05', '+91-9876543204', 'Electronic City, Bangalore', system_user_id),
  ('Prakash Sharma', 'KA0120230005', '2025-07-18', '+91-9876543205', 'HSR Layout, Bangalore', system_user_id),
  ('Ravi Kumar', 'KA0120230006', '2025-09-25', '+91-9876543206', 'Indiranagar, Bangalore', system_user_id),
  ('Santosh Gowda', 'KA0120230007', '2025-04-12', '+91-9876543207', 'BTM Layout, Bangalore', system_user_id),
  ('Mohan Das', 'KA0120230008', '2025-11-08', '+91-9876543208', 'Jayanagar, Bangalore', system_user_id)
  ON CONFLICT (license_number) DO NOTHING;

  -- Initialize fuel tank
  INSERT INTO fuel_tank (capacity, current_level, updated_by) 
  VALUES (10000, 5000, system_user_id)
  ON CONFLICT (id) DO NOTHING;

  -- Sample budget records
  INSERT INTO budget (category, year, month, budgeted_amount, actual_amount, created_by) VALUES
  ('fuel', 2025, 1, 50000, 0, system_user_id),
  ('maintenance', 2025, 1, 30000, 0, system_user_id),
  ('parts', 2025, 1, 20000, 0, system_user_id),
  ('fuel', 2024, 12, 50000, 48500, system_user_id),
  ('maintenance', 2024, 12, 30000, 32500, system_user_id),
  ('parts', 2024, 12, 20000, 18750, system_user_id)
  ON CONFLICT (category, year, month) DO NOTHING;

END $$;