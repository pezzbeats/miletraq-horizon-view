-- Update vendor type enum from ('fuel', 'parts', 'both') to ('fuel', 'parts', 'labour', 'parts_labour')

-- First, update existing 'both' records to 'parts_labour' for consistency
UPDATE vendors 
SET vendor_type = array_replace(vendor_type, 'both', 'parts_labour')
WHERE 'both' = ANY(vendor_type);

-- Note: PostgreSQL array columns don't use enums, so no enum changes needed
-- The vendor_type column is already defined as text[] which supports the new values