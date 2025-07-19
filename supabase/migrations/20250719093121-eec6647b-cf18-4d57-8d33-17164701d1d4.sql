-- Fix the subsidiaries created_by foreign key constraint
-- First, let's check if it's referencing the wrong field
ALTER TABLE subsidiaries DROP CONSTRAINT IF EXISTS subsidiaries_created_by_fkey;

-- Add the correct foreign key constraint to profiles.id instead of auth.users
ALTER TABLE subsidiaries 
ADD CONSTRAINT subsidiaries_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES profiles(id);

-- Also update the subsidiaries table to use profile IDs for created_by
UPDATE subsidiaries 
SET created_by = p.id 
FROM profiles p 
WHERE subsidiaries.created_by IS NULL 
OR NOT EXISTS (SELECT 1 FROM profiles WHERE id = subsidiaries.created_by);