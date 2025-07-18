-- Step 2: Update user data and add subsidiary_id columns
-- Update existing admin users to be super admins with access to all subsidiaries
UPDATE public.profiles 
SET 
  is_super_admin = true,
  subsidiary_access = (
    SELECT jsonb_agg(id) 
    FROM public.subsidiaries 
    WHERE is_active = true
  ),
  default_subsidiary_id = (SELECT id FROM public.subsidiaries WHERE subsidiary_code = 'SKT' LIMIT 1)
WHERE role = 'admin';

-- Update non-admin users to have access to default subsidiary
UPDATE public.profiles 
SET 
  subsidiary_access = jsonb_build_array((SELECT id FROM public.subsidiaries WHERE subsidiary_code = 'SKT' LIMIT 1)),
  default_subsidiary_id = (SELECT id FROM public.subsidiaries WHERE subsidiary_code = 'SKT' LIMIT 1)
WHERE role != 'admin' AND subsidiary_access = '[]'::jsonb;

-- Add subsidiary_id to existing tables
ALTER TABLE public.vehicles ADD COLUMN subsidiary_id UUID REFERENCES public.subsidiaries(id);
ALTER TABLE public.drivers ADD COLUMN subsidiary_id UUID REFERENCES public.subsidiaries(id);
ALTER TABLE public.fuel_log ADD COLUMN subsidiary_id UUID REFERENCES public.subsidiaries(id);
ALTER TABLE public.fuel_purchases ADD COLUMN subsidiary_id UUID REFERENCES public.subsidiaries(id);
ALTER TABLE public.maintenance_log ADD COLUMN subsidiary_id UUID REFERENCES public.subsidiaries(id);
ALTER TABLE public.vendors ADD COLUMN subsidiary_id UUID REFERENCES public.subsidiaries(id);
ALTER TABLE public.parts_master ADD COLUMN subsidiary_id UUID REFERENCES public.subsidiaries(id);
ALTER TABLE public.maintenance_categories ADD COLUMN subsidiary_id UUID REFERENCES public.subsidiaries(id);
ALTER TABLE public.vehicle_documents ADD COLUMN subsidiary_id UUID REFERENCES public.subsidiaries(id);
ALTER TABLE public.budget ADD COLUMN subsidiary_id UUID REFERENCES public.subsidiaries(id);
ALTER TABLE public.odometer_readings ADD COLUMN subsidiary_id UUID REFERENCES public.subsidiaries(id);
ALTER TABLE public.fuel_tank ADD COLUMN subsidiary_id UUID REFERENCES public.subsidiaries(id);