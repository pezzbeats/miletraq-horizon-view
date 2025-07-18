-- Insert sample data for MileTraq testing
DO $$
DECLARE
  system_user_id UUID := '00000000-0000-0000-0000-000000000000'::UUID;
  driver1_id UUID;
  driver2_id UUID;
  vehicle1_id UUID;
  vehicle2_id UUID;
  vendor1_id UUID;
  vendor2_id UUID;
  cat_engine UUID;
  cat_brake UUID;
BEGIN
  
  -- Sample maintenance categories
  INSERT INTO maintenance_categories (name, description, created_by) 
  VALUES 
    ('Engine', 'Engine related parts and maintenance', system_user_id),
    ('Brake', 'Brake system components', system_user_id),
    ('Tyre', 'Tyres and wheel related', system_user_id),
    ('Electrical', 'Electrical system components', system_user_id),
    ('Body', 'Body work and exterior', system_user_id)
  RETURNING id INTO cat_engine;
  
  -- Get category IDs
  SELECT id INTO cat_engine FROM maintenance_categories WHERE name = 'Engine';
  SELECT id INTO cat_brake FROM maintenance_categories WHERE name = 'Brake';
  
  -- Sample parts
  INSERT INTO parts_master (name, category_id, part_number, description, created_by) VALUES
  ('Engine Oil Filter', cat_engine, 'EF001', 'Standard engine oil filter', system_user_id),
  ('Air Filter', cat_engine, 'AF001', 'Air intake filter', system_user_id),
  ('Brake Pads Front', cat_brake, 'BP001', 'Front brake pad set', system_user_id),
  ('Brake Pads Rear', cat_brake, 'BP002', 'Rear brake pad set', system_user_id);
  
  -- Sample vendors
  INSERT INTO vendors (name, vendor_type, contact_person, phone, email, address, created_by) 
  VALUES 
    ('Shell Fuel Station', '{"fuel"}', 'Rajesh Kumar', '+91-9876543210', 'rajesh@shell.com', 'MG Road, Bangalore', system_user_id),
    ('HP Petrol Pump', '{"fuel"}', 'Suresh Patel', '+91-9876543211', 'suresh@hp.com', 'Ring Road, Bangalore', system_user_id),
    ('Bosch Auto Parts', '{"parts"}', 'Amit Singh', '+91-9876543212', 'amit@bosch.com', 'Industrial Area, Bangalore', system_user_id),
    ('TVS Motor Service', '{"parts","maintenance"}', 'Prakash Reddy', '+91-9876543213', 'prakash@tvs.com', 'Service Road, Bangalore', system_user_id)
  RETURNING id INTO vendor1_id;
  
  -- Get vendor IDs
  SELECT id INTO vendor1_id FROM vendors WHERE name = 'Shell Fuel Station';
  SELECT id INTO vendor2_id FROM vendors WHERE name = 'HP Petrol Pump';
  
  -- Sample drivers
  INSERT INTO drivers (name, license_number, license_expiry, phone, address, created_by) 
  VALUES 
    ('Ramesh Kumar', 'KA0120230001', '2025-06-15', '+91-9876543201', 'JP Nagar, Bangalore', system_user_id),
    ('Suresh Patel', 'KA0120230002', '2025-08-20', '+91-9876543202', 'Koramangala, Bangalore', system_user_id),
    ('Vijay Singh', 'KA0120230003', '2025-03-10', '+91-9876543203', 'Whitefield, Bangalore', system_user_id),
    ('Manjunath Reddy', 'KA0120230004', '2025-12-05', '+91-9876543204', 'Electronic City, Bangalore', system_user_id)
  RETURNING id INTO driver1_id;
  
  -- Get driver IDs
  SELECT id INTO driver1_id FROM drivers WHERE name = 'Ramesh Kumar';
  SELECT id INTO driver2_id FROM drivers WHERE name = 'Suresh Patel';
  
  -- Sample vehicles
  INSERT INTO vehicles (vehicle_number, make, model, year, fuel_type, default_driver_id, tank_capacity, insurance_expiry, rc_expiry, puc_expiry, permit_expiry, created_by)
  VALUES 
    ('KA01AB1234', 'Mahindra', 'Bolero', 2022, 'diesel', driver1_id, 90, '2025-06-30', '2030-05-15', '2025-02-28', '2025-12-31', system_user_id),
    ('KA01CD5678', 'Tata', 'Ace', 2021, 'diesel', driver2_id, 40, '2025-08-15', '2030-07-20', '2025-03-15', '2025-11-30', system_user_id),
    ('KA01EF9012', 'Ashok Leyland', 'Dost', 2023, 'diesel', driver1_id, 60, '2025-09-10', '2030-08-25', '2025-04-10', '2025-10-31', system_user_id),
    ('KA01GH3456', 'Mahindra', 'Pickup', 2022, 'diesel', driver2_id, 70, '2025-07-20', '2030-06-15', '2025-01-20', '2025-09-30', system_user_id)
  RETURNING id INTO vehicle1_id;
  
  -- Get vehicle IDs
  SELECT id INTO vehicle1_id FROM vehicles WHERE vehicle_number = 'KA01AB1234';
  SELECT id INTO vehicle2_id FROM vehicles WHERE vehicle_number = 'KA01CD5678';
  
  -- Sample budget records
  INSERT INTO budget (category, year, month, budgeted_amount, actual_amount, created_by) VALUES
  ('fuel', 2025, 1, 50000, 0, system_user_id),
  ('maintenance', 2025, 1, 30000, 0, system_user_id),
  ('parts', 2025, 1, 20000, 0, system_user_id),
  ('fuel', 2024, 12, 50000, 48500, system_user_id),
  ('maintenance', 2024, 12, 30000, 32500, system_user_id),
  ('parts', 2024, 12, 20000, 18750, system_user_id);

  -- Sample fuel purchases (recent)
  INSERT INTO fuel_purchases (vendor_id, purchase_date, volume, rate_per_liter, total_cost, invoice_number, created_by)
  VALUES 
    (vendor1_id, '2025-01-15', 2000, 85.50, 171000, 'INV001', system_user_id),
    (vendor2_id, '2025-01-10', 1500, 86.20, 129300, 'INV002', system_user_id),
    (vendor1_id, '2025-01-05', 1000, 85.80, 85800, 'INV003', system_user_id);

  -- Sample odometer readings
  INSERT INTO odometer_readings (vehicle_id, reading_date, odometer_reading, notes, created_by)
  VALUES 
    (vehicle1_id, '2025-01-01', 45000, 'Initial reading', system_user_id),
    (vehicle2_id, '2025-01-01', 32000, 'Initial reading', system_user_id),
    (vehicle1_id, '2025-01-10', 45500, 'Regular reading', system_user_id),
    (vehicle2_id, '2025-01-10', 32300, 'Regular reading', system_user_id);

  -- Sample fuel log entries (will auto-calculate mileage)
  INSERT INTO fuel_log (vehicle_id, date, fuel_source, fuel_volume, odometer_reading, rate_per_liter, total_cost, driver_id, vendor_id, created_by)
  VALUES 
    (vehicle1_id, '2025-01-12', 'internal_tank', 50, 45650, 85.50, 4275, driver1_id, NULL, system_user_id),
    (vehicle2_id, '2025-01-12', 'external_pump', 30, 32400, 86.20, 2586, driver2_id, vendor2_id, system_user_id),
    (vehicle1_id, '2025-01-15', 'internal_tank', 60, 45850, 85.50, 5130, driver1_id, NULL, system_user_id);

  -- Sample vehicle documents
  INSERT INTO vehicle_documents (vehicle_id, document_type, document_name, document_number, issue_date, expiry_date, issuing_authority, created_by)
  VALUES 
    (vehicle1_id, 'rc', 'Registration Certificate', 'RC123456', '2020-05-15', '2030-05-15', 'Transport Department', system_user_id),
    (vehicle1_id, 'insurance', 'Vehicle Insurance', 'INS789012', '2024-06-30', '2025-06-30', 'ICICI Lombard', system_user_id),
    (vehicle2_id, 'rc', 'Registration Certificate', 'RC654321', '2021-07-20', '2030-07-20', 'Transport Department', system_user_id),
    (vehicle2_id, 'insurance', 'Vehicle Insurance', 'INS345678', '2024-08-15', '2025-08-15', 'Bajaj Allianz', system_user_id);
    
END $$;