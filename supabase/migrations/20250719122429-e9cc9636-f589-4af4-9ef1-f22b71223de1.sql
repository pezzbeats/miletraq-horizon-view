
-- Create the user_role enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'manager', 'fuel_manager', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ensure the profiles table has the correct structure
ALTER TABLE profiles 
ALTER COLUMN role TYPE user_role USING role::text::user_role;

-- Set default value for role column
ALTER TABLE profiles 
ALTER COLUMN role SET DEFAULT 'viewer'::user_role;
