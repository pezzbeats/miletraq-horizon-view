-- Step 3: Migrate existing data to default subsidiary (SKT)
UPDATE public.vehicles SET subsidiary_id = (SELECT id FROM public.subsidiaries WHERE subsidiary_code = 'SKT' LIMIT 1) WHERE subsidiary_id IS NULL;
UPDATE public.drivers SET subsidiary_id = (SELECT id FROM public.subsidiaries WHERE subsidiary_code = 'SKT' LIMIT 1) WHERE subsidiary_id IS NULL;
UPDATE public.fuel_log SET subsidiary_id = (SELECT id FROM public.subsidiaries WHERE subsidiary_code = 'SKT' LIMIT 1) WHERE subsidiary_id IS NULL;
UPDATE public.fuel_purchases SET subsidiary_id = (SELECT id FROM public.subsidiaries WHERE subsidiary_code = 'SKT' LIMIT 1) WHERE subsidiary_id IS NULL;
UPDATE public.maintenance_log SET subsidiary_id = (SELECT id FROM public.subsidiaries WHERE subsidiary_code = 'SKT' LIMIT 1) WHERE subsidiary_id IS NULL;
UPDATE public.vendors SET subsidiary_id = (SELECT id FROM public.subsidiaries WHERE subsidiary_code = 'SKT' LIMIT 1) WHERE subsidiary_id IS NULL;
UPDATE public.parts_master SET subsidiary_id = (SELECT id FROM public.subsidiaries WHERE subsidiary_code = 'SKT' LIMIT 1) WHERE subsidiary_id IS NULL;
UPDATE public.maintenance_categories SET subsidiary_id = (SELECT id FROM public.subsidiaries WHERE subsidiary_code = 'SKT' LIMIT 1) WHERE subsidiary_id IS NULL;
UPDATE public.vehicle_documents SET subsidiary_id = (SELECT id FROM public.subsidiaries WHERE subsidiary_code = 'SKT' LIMIT 1) WHERE subsidiary_id IS NULL;
UPDATE public.budget SET subsidiary_id = (SELECT id FROM public.subsidiaries WHERE subsidiary_code = 'SKT' LIMIT 1) WHERE subsidiary_id IS NULL;
UPDATE public.odometer_readings SET subsidiary_id = (SELECT id FROM public.subsidiaries WHERE subsidiary_code = 'SKT' LIMIT 1) WHERE subsidiary_id IS NULL;
UPDATE public.fuel_tank SET subsidiary_id = (SELECT id FROM public.subsidiaries WHERE subsidiary_code = 'SKT' LIMIT 1) WHERE subsidiary_id IS NULL;

-- Make subsidiary_id NOT NULL after migration
ALTER TABLE public.vehicles ALTER COLUMN subsidiary_id SET NOT NULL;
ALTER TABLE public.drivers ALTER COLUMN subsidiary_id SET NOT NULL;
ALTER TABLE public.fuel_log ALTER COLUMN subsidiary_id SET NOT NULL;
ALTER TABLE public.fuel_purchases ALTER COLUMN subsidiary_id SET NOT NULL;
ALTER TABLE public.maintenance_log ALTER COLUMN subsidiary_id SET NOT NULL;
ALTER TABLE public.vendors ALTER COLUMN subsidiary_id SET NOT NULL;
ALTER TABLE public.parts_master ALTER COLUMN subsidiary_id SET NOT NULL;
ALTER TABLE public.maintenance_categories ALTER COLUMN subsidiary_id SET NOT NULL;
ALTER TABLE public.vehicle_documents ALTER COLUMN subsidiary_id SET NOT NULL;
ALTER TABLE public.budget ALTER COLUMN subsidiary_id SET NOT NULL;
ALTER TABLE public.odometer_readings ALTER COLUMN subsidiary_id SET NOT NULL;
ALTER TABLE public.fuel_tank ALTER COLUMN subsidiary_id SET NOT NULL;