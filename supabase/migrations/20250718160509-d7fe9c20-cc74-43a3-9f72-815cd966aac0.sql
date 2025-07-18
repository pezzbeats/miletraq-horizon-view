-- Add sample vendors with new vendor types for testing
INSERT INTO vendors (name, vendor_type, contact_person, phone, email, address, is_active, created_by)
VALUES 
  ('AutoCare Mechanics', ARRAY['labour'], 'Rajesh Kumar', '9876543210', 'rajesh@autocare.com', '123 Service Road, Delhi', true, (SELECT id FROM auth.users LIMIT 1)),
  ('Complete Auto Solutions', ARRAY['parts_labour'], 'Suresh Sharma', '9876543211', 'suresh@completeauto.com', '456 Workshop Street, Mumbai', true, (SELECT id FROM auth.users LIMIT 1)),
  ('Engine Masters', ARRAY['labour'], 'Amit Singh', '9876543212', 'amit@enginemasters.com', '789 Repair Lane, Bangalore', true, (SELECT id FROM auth.users LIMIT 1)),
  ('Parts & Service Hub', ARRAY['parts_labour'], 'Vijay Patel', '9876543213', 'vijay@partshub.com', '321 Auto Market, Chennai', true, (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT (name) DO NOTHING;