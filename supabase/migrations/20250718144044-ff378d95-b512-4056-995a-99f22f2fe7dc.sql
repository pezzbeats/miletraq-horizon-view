-- Update tank capacity to 3000 liters and set low level threshold
UPDATE fuel_tank 
SET capacity = 3000,
    current_level = LEAST(current_level, 3000)  -- Ensure current level doesn't exceed new capacity
WHERE id = (SELECT id FROM fuel_tank LIMIT 1);

-- If no tank exists, create one with 3000L capacity
INSERT INTO fuel_tank (current_level, capacity, updated_by)
SELECT 0, 3000, (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM fuel_tank);

-- Add low level threshold configuration
ALTER TABLE fuel_tank 
ADD COLUMN IF NOT EXISTS low_level_threshold numeric DEFAULT 500;