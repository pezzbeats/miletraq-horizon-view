-- Update diesel tank capacity to 3000L and threshold to 600L (20% of capacity)
UPDATE fuel_tanks 
SET 
  capacity = 3000,
  low_threshold = 600,
  updated_at = now()
WHERE fuel_type = 'diesel' AND is_active = true;

-- Also update the old fuel_tank table if it exists
UPDATE fuel_tank 
SET 
  capacity = 3000,
  low_level_threshold = 600,
  last_updated = now()
WHERE id IN (SELECT id FROM fuel_tank LIMIT 1);

-- If no diesel tank exists, create one
INSERT INTO fuel_tanks (
  fuel_type,
  capacity,
  current_volume,
  low_threshold,
  unit,
  tank_location,
  subsidiary_id,
  is_active,
  created_by
)
SELECT 
  'diesel'::fuel_type_enum,
  3000,
  0,
  600,
  'liters'::fuel_unit_enum,
  'Main Storage',
  s.id,
  true,
  p.id
FROM subsidiaries s
CROSS JOIN profiles p
WHERE s.is_active = true 
  AND p.is_super_admin = true
  AND NOT EXISTS (
    SELECT 1 FROM fuel_tanks ft 
    WHERE ft.fuel_type = 'diesel' 
      AND ft.subsidiary_id = s.id 
      AND ft.is_active = true
  )
LIMIT 1;