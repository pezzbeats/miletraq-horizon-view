-- Add foreign key constraint to link odometer_readings.created_by to profiles.id
-- First, we need to update existing records to reference profiles.id instead of auth.users.id

-- Update existing odometer_readings to use profile IDs
UPDATE odometer_readings 
SET created_by = p.id 
FROM profiles p 
WHERE odometer_readings.created_by = p.user_id;

-- Add foreign key constraint
ALTER TABLE odometer_readings 
ADD CONSTRAINT fk_odometer_readings_created_by 
FOREIGN KEY (created_by) REFERENCES profiles(id);