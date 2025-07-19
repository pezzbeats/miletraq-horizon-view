-- Add vehicle_name column to vehicles table
ALTER TABLE public.vehicles ADD COLUMN vehicle_name TEXT;

-- Update existing vehicles with generated names based on their type and subsidiary
-- For school-related subsidiaries, use S-1, S-2 format for buses, M-1, M-2 for cars
-- For construction, use C-1, C-2 format
-- For hotels, use H-1, H-2 format

-- Update Sai Public School vehicles (School buses: S-1, S-2, etc.)
WITH numbered_vehicles AS (
  SELECT id, 
         ROW_NUMBER() OVER (ORDER BY created_at) as rn,
         CASE 
           WHEN LOWER(make) LIKE '%bus%' OR LOWER(model) LIKE '%bus%' OR LOWER(model) LIKE '%school%' THEN 'S-'
           WHEN LOWER(make) = 'maruti' OR LOWER(model) LIKE '%car%' OR LOWER(model) LIKE '%eeco%' THEN 'M-'
           ELSE 'V-'
         END as prefix
  FROM vehicles 
  WHERE subsidiary_id = (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Sai Public School, Kashipur')
)
UPDATE vehicles 
SET vehicle_name = nv.prefix || nv.rn
FROM numbered_vehicles nv
WHERE vehicles.id = nv.id;

-- Update Shri Sai Public School vehicles 
WITH numbered_vehicles AS (
  SELECT id, 
         ROW_NUMBER() OVER (ORDER BY created_at) as rn,
         CASE 
           WHEN LOWER(make) LIKE '%bus%' OR LOWER(model) LIKE '%bus%' OR LOWER(model) LIKE '%school%' THEN 'SS-'
           WHEN LOWER(make) = 'maruti' OR LOWER(model) LIKE '%car%' OR LOWER(model) LIKE '%eeco%' THEN 'SM-'
           ELSE 'SV-'
         END as prefix
  FROM vehicles 
  WHERE subsidiary_id = (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Shri Sai Public School, Kashipur')
)
UPDATE vehicles 
SET vehicle_name = nv.prefix || nv.rn
FROM numbered_vehicles nv
WHERE vehicles.id = nv.id;

-- Update SKT Buildcon vehicles (Construction: C-1, C-2, etc.)
WITH numbered_vehicles AS (
  SELECT id, 
         ROW_NUMBER() OVER (ORDER BY created_at) as rn,
         'C-' as prefix
  FROM vehicles 
  WHERE subsidiary_id = (SELECT id FROM subsidiaries WHERE subsidiary_name = 'SKT Buildcon Pvt Ltd')
)
UPDATE vehicles 
SET vehicle_name = nv.prefix || nv.rn
FROM numbered_vehicles nv
WHERE vehicles.id = nv.id;

-- Update Hotel Drona Palace vehicles (Hotel: H-1, H-2, etc.)
WITH numbered_vehicles AS (
  SELECT id, 
         ROW_NUMBER() OVER (ORDER BY created_at) as rn,
         'H-' as prefix
  FROM vehicles 
  WHERE subsidiary_id = (SELECT id FROM subsidiaries WHERE subsidiary_name = 'Hotel Drona Palace')
)
UPDATE vehicles 
Set vehicle_name = nv.prefix || nv.rn
FROM numbered_vehicles nv
WHERE vehicles.id = nv.id;

-- Handle any vehicles with NULL subsidiary_id (fallback)
UPDATE vehicles 
SET vehicle_name = 'V-' || (SELECT COUNT(*) FROM vehicles v2 WHERE v2.id <= vehicles.id)
WHERE vehicle_name IS NULL;

-- Add unique constraint within subsidiary for vehicle names
ALTER TABLE public.vehicles ADD CONSTRAINT unique_vehicle_name_per_subsidiary 
UNIQUE (subsidiary_id, vehicle_name);