-- Update vehicles with correct default drivers by matching subsidiary and vehicle number

-- Shri Sai Public School vehicles (subsidiary_id: 71b61011-6024-463a-a821-b9bece1e7b34)
UPDATE vehicles SET default_driver_id = (
  SELECT d.id FROM drivers d 
  WHERE d.name = 'TRILOK' 
  AND d.subsidiary_id = '71b61011-6024-463a-a821-b9bece1e7b34'
) WHERE vehicle_number = 'UK06PA0284' AND subsidiary_id = '71b61011-6024-463a-a821-b9bece1e7b34';

UPDATE vehicles SET default_driver_id = (
  SELECT d.id FROM drivers d 
  WHERE d.name = 'RAJKUMAR' 
  AND d.subsidiary_id = '71b61011-6024-463a-a821-b9bece1e7b34'
) WHERE vehicle_number = 'UK06PA0305' AND subsidiary_id = '71b61011-6024-463a-a821-b9bece1e7b34';

UPDATE vehicles SET default_driver_id = (
  SELECT d.id FROM drivers d 
  WHERE d.name = 'RAM SINGH' 
  AND d.subsidiary_id = '71b61011-6024-463a-a821-b9bece1e7b34'
) WHERE vehicle_number = 'UK18TA1680' AND subsidiary_id = '71b61011-6024-463a-a821-b9bece1e7b34';

UPDATE vehicles SET default_driver_id = (
  SELECT d.id FROM drivers d 
  WHERE d.name = 'NISHAN SINGH' 
  AND d.subsidiary_id = '71b61011-6024-463a-a821-b9bece1e7b34'
) WHERE vehicle_number = 'UK18PA0440' AND subsidiary_id = '71b61011-6024-463a-a821-b9bece1e7b34';

UPDATE vehicles SET default_driver_id = (
  SELECT d.id FROM drivers d 
  WHERE d.name = 'BHUWAN' 
  AND d.subsidiary_id = '71b61011-6024-463a-a821-b9bece1e7b34'
) WHERE vehicle_number = 'NB-3' AND subsidiary_id = '71b61011-6024-463a-a821-b9bece1e7b34';

-- Sai Public School vehicles (subsidiary_id: ca6c447c-6646-49fb-b9ca-73de334a634d)
UPDATE vehicles SET default_driver_id = (
  SELECT d.id FROM drivers d 
  WHERE d.name = 'DEVENDER' 
  AND d.subsidiary_id = 'ca6c447c-6646-49fb-b9ca-73de334a634d'
) WHERE vehicle_number = 'NB-1' AND subsidiary_id = 'ca6c447c-6646-49fb-b9ca-73de334a634d';

UPDATE vehicles SET default_driver_id = (
  SELECT d.id FROM drivers d 
  WHERE d.name = 'CHARAN SINGH' 
  AND d.subsidiary_id = 'ca6c447c-6646-49fb-b9ca-73de334a634d'
) WHERE vehicle_number = 'NB-2' AND subsidiary_id = 'ca6c447c-6646-49fb-b9ca-73de334a634d';