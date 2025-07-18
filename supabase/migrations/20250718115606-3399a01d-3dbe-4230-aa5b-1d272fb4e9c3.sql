-- Insert sample data for MileTraq testing (simplified approach)

-- Sample maintenance categories (if not already exist)
INSERT INTO maintenance_categories (name, description, created_by) 
SELECT 'Engine', 'Engine related parts and maintenance', '00000000-0000-0000-0000-000000000000'::UUID
WHERE NOT EXISTS (SELECT 1 FROM maintenance_categories WHERE name = 'Engine');

INSERT INTO maintenance_categories (name, description, created_by) 
SELECT 'Brake', 'Brake system components', '00000000-0000-0000-0000-000000000000'::UUID
WHERE NOT EXISTS (SELECT 1 FROM maintenance_categories WHERE name = 'Brake');

INSERT INTO maintenance_categories (name, description, created_by) 
SELECT 'Tyre', 'Tyres and wheel related', '00000000-0000-0000-0000-000000000000'::UUID
WHERE NOT EXISTS (SELECT 1 FROM maintenance_categories WHERE name = 'Tyre');

-- Sample vendors (if not already exist)
INSERT INTO vendors (name, vendor_type, contact_person, phone, email, address, created_by) 
SELECT 'Shell Fuel Station', '{"fuel"}', 'Rajesh Kumar', '+91-9876543210', 'rajesh@shell.com', 'MG Road, Bangalore', '00000000-0000-0000-0000-000000000000'::UUID
WHERE NOT EXISTS (SELECT 1 FROM vendors WHERE name = 'Shell Fuel Station');

INSERT INTO vendors (name, vendor_type, contact_person, phone, email, address, created_by) 
SELECT 'HP Petrol Pump', '{"fuel"}', 'Suresh Patel', '+91-9876543211', 'suresh@hp.com', 'Ring Road, Bangalore', '00000000-0000-0000-0000-000000000000'::UUID
WHERE NOT EXISTS (SELECT 1 FROM vendors WHERE name = 'HP Petrol Pump');

-- Sample drivers (if not already exist)
INSERT INTO drivers (name, license_number, license_expiry, phone, address, created_by) 
SELECT 'Ramesh Kumar', 'KA0120230001', '2025-06-15', '+91-9876543201', 'JP Nagar, Bangalore', '00000000-0000-0000-0000-000000000000'::UUID
WHERE NOT EXISTS (SELECT 1 FROM drivers WHERE license_number = 'KA0120230001');

INSERT INTO drivers (name, license_number, license_expiry, phone, address, created_by) 
SELECT 'Suresh Patel', 'KA0120230002', '2025-08-20', '+91-9876543202', 'Koramangala, Bangalore', '00000000-0000-0000-0000-000000000000'::UUID
WHERE NOT EXISTS (SELECT 1 FROM drivers WHERE license_number = 'KA0120230002');

-- Sample budget records (if not already exist)
INSERT INTO budget (category, year, month, budgeted_amount, actual_amount, created_by) 
SELECT 'fuel', 2025, 1, 50000, 0, '00000000-0000-0000-0000-000000000000'::UUID
WHERE NOT EXISTS (SELECT 1 FROM budget WHERE category = 'fuel' AND year = 2025 AND month = 1);

INSERT INTO budget (category, year, month, budgeted_amount, actual_amount, created_by) 
SELECT 'maintenance', 2025, 1, 30000, 0, '00000000-0000-0000-0000-000000000000'::UUID
WHERE NOT EXISTS (SELECT 1 FROM budget WHERE category = 'maintenance' AND year = 2025 AND month = 1);

INSERT INTO budget (category, year, month, budgeted_amount, actual_amount, created_by) 
SELECT 'parts', 2025, 1, 20000, 0, '00000000-0000-0000-0000-000000000000'::UUID
WHERE NOT EXISTS (SELECT 1 FROM budget WHERE category = 'parts' AND year = 2025 AND month = 1);