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

-- Insert sample data

-- Sample maintenance categories
INSERT INTO maintenance_categories (name, description, created_by) VALUES
('Engine', 'Engine related parts and maintenance', '00000000-0000-0000-0000-000000000001'),
('Brake', 'Brake system components', '00000000-0000-0000-0000-000000000001'),
('Tyre', 'Tyres and wheel related', '00000000-0000-0000-0000-000000000001'),
('Electrical', 'Electrical system components', '00000000-0000-0000-0000-000000000001'),
('Body', 'Body work and exterior', '00000000-0000-0000-0000-000000000001'),
('Transmission', 'Gearbox and transmission', '00000000-0000-0000-0000-000000000001'),
('Suspension', 'Suspension and steering', '00000000-0000-0000-0000-000000000001'),
('Cooling', 'Radiator and cooling system', '00000000-0000-0000-0000-000000000001'),
('Fuel System', 'Fuel injection and filters', '00000000-0000-0000-0000-000000000001'),
('Exhaust', 'Exhaust system components', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (name) DO NOTHING;

-- Sample parts (get category IDs first)
WITH cat_ids AS (
  SELECT id, name FROM maintenance_categories
)
INSERT INTO parts_master (name, category_id, part_number, description, created_by)
SELECT * FROM (VALUES
  ('Engine Oil Filter', (SELECT id FROM cat_ids WHERE name = 'Engine'), 'EF001', 'Standard engine oil filter', '00000000-0000-0000-0000-000000000001'),
  ('Air Filter', (SELECT id FROM cat_ids WHERE name = 'Engine'), 'AF001', 'Air intake filter', '00000000-0000-0000-0000-000000000001'),
  ('Brake Pads Front', (SELECT id FROM cat_ids WHERE name = 'Brake'), 'BP001', 'Front brake pad set', '00000000-0000-0000-0000-000000000001'),
  ('Brake Pads Rear', (SELECT id FROM cat_ids WHERE name = 'Brake'), 'BP002', 'Rear brake pad set', '00000000-0000-0000-0000-000000000001'),
  ('Brake Disc Front', (SELECT id FROM cat_ids WHERE name = 'Brake'), 'BD001', 'Front brake disc', '00000000-0000-0000-0000-000000000001'),
  ('Tyre 185/65R15', (SELECT id FROM cat_ids WHERE name = 'Tyre'), 'TR001', '185/65R15 tyre', '00000000-0000-0000-0000-000000000001'),
  ('Tyre 205/55R16', (SELECT id FROM cat_ids WHERE name = 'Tyre'), 'TR002', '205/55R16 tyre', '00000000-0000-0000-0000-000000000001'),
  ('Battery 12V', (SELECT id FROM cat_ids WHERE name = 'Electrical'), 'BT001', '12V car battery', '00000000-0000-0000-0000-000000000001'),
  ('Headlight Bulb', (SELECT id FROM cat_ids WHERE name = 'Electrical'), 'HB001', 'H4 headlight bulb', '00000000-0000-0000-0000-000000000001'),
  ('Spark Plugs', (SELECT id FROM cat_ids WHERE name = 'Engine'), 'SP001', 'Set of 4 spark plugs', '00000000-0000-0000-0000-000000000001'),
  ('Gear Oil', (SELECT id FROM cat_ids WHERE name = 'Transmission'), 'GO001', 'Transmission gear oil', '00000000-0000-0000-0000-000000000001'),
  ('Shock Absorber', (SELECT id FROM cat_ids WHERE name = 'Suspension'), 'SA001', 'Front shock absorber', '00000000-0000-0000-0000-000000000001'),
  ('Radiator Coolant', (SELECT id FROM cat_ids WHERE name = 'Cooling'), 'RC001', 'Engine coolant 5L', '00000000-0000-0000-0000-000000000001'),
  ('Fuel Filter', (SELECT id FROM cat_ids WHERE name = 'Fuel System'), 'FF001', 'Diesel fuel filter', '00000000-0000-0000-0000-000000000001'),
  ('Exhaust Pipe', (SELECT id FROM cat_ids WHERE name = 'Exhaust'), 'EP001', 'Main exhaust pipe', '00000000-0000-0000-0000-000000000001')
) AS t(name, category_id, part_number, description, created_by)
ON CONFLICT (name) DO NOTHING;

-- Sample vendors
INSERT INTO vendors (name, vendor_type, contact_person, phone, email, address, created_by) VALUES
('Shell Fuel Station', '{"fuel"}', 'Rajesh Kumar', '+91-9876543210', 'rajesh@shell.com', 'MG Road, Bangalore', '00000000-0000-0000-0000-000000000001'),
('HP Petrol Pump', '{"fuel"}', 'Suresh Patel', '+91-9876543211', 'suresh@hp.com', 'Ring Road, Bangalore', '00000000-0000-0000-0000-000000000001'),
('Bosch Auto Parts', '{"parts"}', 'Amit Singh', '+91-9876543212', 'amit@bosch.com', 'Industrial Area, Bangalore', '00000000-0000-0000-0000-000000000001'),
('TVS Motor Service', '{"parts","maintenance"}', 'Prakash Reddy', '+91-9876543213', 'prakash@tvs.com', 'Service Road, Bangalore', '00000000-0000-0000-0000-000000000001'),
('Mahindra Service Center', '{"parts","maintenance"}', 'Ravi Sharma', '+91-9876543214', 'ravi@mahindra.com', 'Main Road, Bangalore', '00000000-0000-0000-0000-000000000001'),
('Indian Oil Depot', '{"fuel"}', 'Mohan Das', '+91-9876543215', 'mohan@iocl.com', 'Oil Depot Road, Bangalore', '00000000-0000-0000-0000-000000000001'),
('Genuine Parts Store', '{"parts"}', 'Kiran Kumar', '+91-9876543216', 'kiran@parts.com', 'Spare Parts Market, Bangalore', '00000000-0000-0000-0000-000000000001'),
('Auto Care Center', '{"parts","maintenance"}', 'Deepak Joshi', '+91-9876543217', 'deepak@autocare.com', 'Service Lane, Bangalore', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (name) DO NOTHING;

-- Sample drivers
INSERT INTO drivers (name, license_number, license_expiry, phone, address, created_by) VALUES
('Ramesh Kumar', 'KA0120230001', '2025-06-15', '+91-9876543201', 'JP Nagar, Bangalore', '00000000-0000-0000-0000-000000000001'),
('Suresh Patel', 'KA0120230002', '2025-08-20', '+91-9876543202', 'Koramangala, Bangalore', '00000000-0000-0000-0000-000000000001'),
('Vijay Singh', 'KA0120230003', '2025-03-10', '+91-9876543203', 'Whitefield, Bangalore', '00000000-0000-0000-0000-000000000001'),
('Manjunath Reddy', 'KA0120230004', '2025-12-05', '+91-9876543204', 'Electronic City, Bangalore', '00000000-0000-0000-0000-000000000001'),
('Prakash Sharma', 'KA0120230005', '2025-07-18', '+91-9876543205', 'HSR Layout, Bangalore', '00000000-0000-0000-0000-000000000001'),
('Ravi Kumar', 'KA0120230006', '2025-09-25', '+91-9876543206', 'Indiranagar, Bangalore', '00000000-0000-0000-0000-000000000001'),
('Santosh Gowda', 'KA0120230007', '2025-04-12', '+91-9876543207', 'BTM Layout, Bangalore', '00000000-0000-0000-0000-000000000001'),
('Mohan Das', 'KA0120230008', '2025-11-08', '+91-9876543208', 'Jayanagar, Bangalore', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (license_number) DO NOTHING;

-- Sample vehicles
WITH driver_ids AS (
  SELECT id, name FROM drivers LIMIT 8
)
INSERT INTO vehicles (vehicle_number, make, model, year, fuel_type, default_driver_id, tank_capacity, insurance_expiry, rc_expiry, puc_expiry, permit_expiry, created_by)
SELECT * FROM (VALUES
  ('KA01AB1234', 'Mahindra', 'Bolero', 2022, 'diesel', (SELECT id FROM driver_ids WHERE name = 'Ramesh Kumar'), 90, '2025-06-30', '2030-05-15', '2025-02-28', '2025-12-31', '00000000-0000-0000-0000-000000000001'),
  ('KA01CD5678', 'Tata', 'Ace', 2021, 'diesel', (SELECT id FROM driver_ids WHERE name = 'Suresh Patel'), 40, '2025-08-15', '2030-07-20', '2025-03-15', '2025-11-30', '00000000-0000-0000-0000-000000000001'),
  ('KA01EF9012', 'Ashok Leyland', 'Dost', 2023, 'diesel', (SELECT id FROM driver_ids WHERE name = 'Vijay Singh'), 60, '2025-09-10', '2030-08-25', '2025-04-10', '2025-10-31', '00000000-0000-0000-0000-000000000001'),
  ('KA01GH3456', 'Mahindra', 'Pickup', 2022, 'diesel', (SELECT id FROM driver_ids WHERE name = 'Manjunath Reddy'), 70, '2025-07-20', '2030-06-15', '2025-01-20', '2025-09-30', '00000000-0000-0000-0000-000000000001'),
  ('KA01IJ7890', 'Force', 'Traveller', 2021, 'diesel', (SELECT id FROM driver_ids WHERE name = 'Prakash Sharma'), 80, '2025-05-25', '2030-04-10', '2025-02-25', '2025-08-31', '00000000-0000-0000-0000-000000000001'),
  ('KA01KL1234', 'Tata', 'Magic', 2023, 'cng', (SELECT id FROM driver_ids WHERE name = 'Ravi Kumar'), 50, '2025-10-15', '2030-09-20', '2025-05-15', '2025-12-31', '00000000-0000-0000-0000-000000000001'),
  ('KA01MN5678', 'Bajaj', 'RE Auto', 2022, 'cng', (SELECT id FROM driver_ids WHERE name = 'Santosh Gowda'), 15, '2025-06-10', '2030-05-25', '2025-03-10', '2025-11-30', '00000000-0000-0000-0000-000000000001'),
  ('KA01OP9012', 'Maruti', 'Eeco', 2021, 'petrol', (SELECT id FROM driver_ids WHERE name = 'Mohan Das'), 40, '2025-08-05', '2030-07-15', '2025-04-05', '2025-10-31', '00000000-0000-0000-0000-000000000001')
) AS t(vehicle_number, make, model, year, fuel_type, default_driver_id, tank_capacity, insurance_expiry, rc_expiry, puc_expiry, permit_expiry, created_by)
ON CONFLICT (vehicle_number) DO NOTHING;

-- Initialize fuel tank
INSERT INTO fuel_tank (capacity, current_level, updated_by) 
VALUES (10000, 5000, '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Sample budget records
INSERT INTO budget (category, year, month, budgeted_amount, actual_amount, created_by) VALUES
('fuel', 2025, 1, 50000, 0, '00000000-0000-0000-0000-000000000001'),
('maintenance', 2025, 1, 30000, 0, '00000000-0000-0000-0000-000000000001'),
('parts', 2025, 1, 20000, 0, '00000000-0000-0000-0000-000000000001'),
('fuel', 2024, 12, 50000, 48500, '00000000-0000-0000-0000-000000000001'),
('maintenance', 2024, 12, 30000, 32500, '00000000-0000-0000-0000-000000000001'),
('parts', 2024, 12, 20000, 18750, '00000000-0000-0000-0000-000000000001')
ON CONFLICT (category, year, month) DO NOTHING;

-- Sample fuel purchases (recent)
WITH vendor_ids AS (
  SELECT id, name FROM vendors WHERE 'fuel' = ANY(vendor_type)
)
INSERT INTO fuel_purchases (vendor_id, purchase_date, volume, rate_per_liter, total_cost, invoice_number, created_by)
SELECT * FROM (VALUES
  ((SELECT id FROM vendor_ids WHERE name = 'Indian Oil Depot'), '2025-01-15', 2000, 85.50, 171000, 'INV001', '00000000-0000-0000-0000-000000000001'),
  ((SELECT id FROM vendor_ids WHERE name = 'Shell Fuel Station'), '2025-01-10', 1500, 86.20, 129300, 'INV002', '00000000-0000-0000-0000-000000000001'),
  ((SELECT id FROM vendor_ids WHERE name = 'HP Petrol Pump'), '2025-01-05', 1000, 85.80, 85800, 'INV003', '00000000-0000-0000-0000-000000000001')
) AS t(vendor_id, purchase_date, volume, rate_per_liter, total_cost, invoice_number, created_by)
ON CONFLICT (invoice_number) DO NOTHING;

-- Sample odometer readings
WITH vehicle_data AS (
  SELECT id, vehicle_number FROM vehicles
)
INSERT INTO odometer_readings (vehicle_id, reading_date, odometer_reading, notes, created_by)
SELECT * FROM (VALUES
  ((SELECT id FROM vehicle_data WHERE vehicle_number = 'KA01AB1234'), '2025-01-01', 45000, 'Initial reading', '00000000-0000-0000-0000-000000000001'),
  ((SELECT id FROM vehicle_data WHERE vehicle_number = 'KA01CD5678'), '2025-01-01', 32000, 'Initial reading', '00000000-0000-0000-0000-000000000001'),
  ((SELECT id FROM vehicle_data WHERE vehicle_number = 'KA01EF9012'), '2025-01-01', 28000, 'Initial reading', '00000000-0000-0000-0000-000000000001'),
  ((SELECT id FROM vehicle_data WHERE vehicle_number = 'KA01GH3456'), '2025-01-01', 38000, 'Initial reading', '00000000-0000-0000-0000-000000000001'),
  ((SELECT id FROM vehicle_data WHERE vehicle_number = 'KA01IJ7890'), '2025-01-01', 55000, 'Initial reading', '00000000-0000-0000-0000-000000000001'),
  ((SELECT id FROM vehicle_data WHERE vehicle_number = 'KA01KL1234'), '2025-01-01', 25000, 'Initial reading', '00000000-0000-0000-0000-000000000001'),
  ((SELECT id FROM vehicle_data WHERE vehicle_number = 'KA01MN5678'), '2025-01-01', 15000, 'Initial reading', '00000000-0000-0000-0000-000000000001'),
  ((SELECT id FROM vehicle_data WHERE vehicle_number = 'KA01OP9012'), '2025-01-01', 42000, 'Initial reading', '00000000-0000-0000-0000-000000000001')
) AS t(vehicle_id, reading_date, odometer_reading, notes, created_by)
ON CONFLICT (vehicle_id, reading_date) DO NOTHING;