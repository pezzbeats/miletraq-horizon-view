-- Create subsidiaries table
CREATE TABLE public.subsidiaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subsidiary_name TEXT NOT NULL,
  subsidiary_code TEXT NOT NULL UNIQUE,
  business_type TEXT NOT NULL CHECK (business_type IN ('construction', 'hospitality', 'education', 'other')),
  gstin TEXT,
  registered_address TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS on subsidiaries
ALTER TABLE public.subsidiaries ENABLE ROW LEVEL SECURITY;

-- Create policies for subsidiaries
CREATE POLICY "Users can view subsidiaries they have access to" 
ON public.subsidiaries 
FOR SELECT 
USING (
  id = ANY(
    SELECT unnest(
      COALESCE(
        (SELECT subsidiary_access::uuid[] 
         FROM public.profiles 
         WHERE user_id = auth.uid()),
        ARRAY[]::uuid[]
      )
    )
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (is_super_admin = true OR role = 'admin')
  )
);

CREATE POLICY "Super admins can manage subsidiaries" 
ON public.subsidiaries 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (is_super_admin = true OR role = 'admin')
  )
);

-- Insert default subsidiaries
INSERT INTO public.subsidiaries (subsidiary_name, subsidiary_code, business_type, gstin, registered_address, contact_person) VALUES
('SKT Buildcon Pvt Ltd', 'SKT', 'construction', '05AANCS6817P1ZL', 'Kashipur, Uttarakhand', 'Construction Manager'),
('Hotel Drona Palace', 'HDP', 'hospitality', '05ABOFS1823N1ZS', 'Kashipur, Uttarakhand', 'Hotel Manager'),
('Sai Public School', 'SPS1', 'education', NULL, 'Kashipur, Uttarakhand', 'School Principal'),
('Shri Sai Public School', 'SPS2', 'education', NULL, 'Kashipur, Uttarakhand', 'School Principal');

-- Add subsidiary-related columns to profiles
ALTER TABLE public.profiles ADD COLUMN subsidiary_access JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN default_subsidiary_id UUID REFERENCES public.subsidiaries(id);
ALTER TABLE public.profiles ADD COLUMN is_super_admin BOOLEAN DEFAULT false;

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

-- Migrate existing data to default subsidiary (SKT)
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

-- Update RLS policies to include subsidiary filtering
-- Vehicles
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.vehicles;
CREATE POLICY "Users can view vehicles from accessible subsidiaries" 
ON public.vehicles FOR SELECT 
USING (
  subsidiary_id = ANY(
    SELECT unnest(
      COALESCE(
        (SELECT subsidiary_access::uuid[] FROM public.profiles WHERE user_id = auth.uid()),
        ARRAY[]::uuid[]
      )
    )
  ) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_super_admin = true)
);

CREATE POLICY "Users can manage vehicles in accessible subsidiaries" 
ON public.vehicles FOR ALL 
USING (
  subsidiary_id = ANY(
    SELECT unnest(
      COALESCE(
        (SELECT subsidiary_access::uuid[] FROM public.profiles WHERE user_id = auth.uid()),
        ARRAY[]::uuid[]
      )
    )
  ) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_super_admin = true)
);

-- Drivers
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.drivers;
CREATE POLICY "Users can view drivers from accessible subsidiaries" 
ON public.drivers FOR SELECT 
USING (
  subsidiary_id = ANY(
    SELECT unnest(
      COALESCE(
        (SELECT subsidiary_access::uuid[] FROM public.profiles WHERE user_id = auth.uid()),
        ARRAY[]::uuid[]
      )
    )
  ) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_super_admin = true)
);

CREATE POLICY "Users can manage drivers in accessible subsidiaries" 
ON public.drivers FOR ALL 
USING (
  subsidiary_id = ANY(
    SELECT unnest(
      COALESCE(
        (SELECT subsidiary_access::uuid[] FROM public.profiles WHERE user_id = auth.uid()),
        ARRAY[]::uuid[]
      )
    )
  ) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_super_admin = true)
);

-- Apply similar patterns to other tables
-- Fuel Log
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.fuel_log;
CREATE POLICY "Users can access fuel logs from accessible subsidiaries" 
ON public.fuel_log FOR ALL 
USING (
  subsidiary_id = ANY(
    SELECT unnest(
      COALESCE(
        (SELECT subsidiary_access::uuid[] FROM public.profiles WHERE user_id = auth.uid()),
        ARRAY[]::uuid[]
      )
    )
  ) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_super_admin = true)
);

-- Maintenance Log
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.maintenance_log;
CREATE POLICY "Users can access maintenance logs from accessible subsidiaries" 
ON public.maintenance_log FOR ALL 
USING (
  subsidiary_id = ANY(
    SELECT unnest(
      COALESCE(
        (SELECT subsidiary_access::uuid[] FROM public.profiles WHERE user_id = auth.uid()),
        ARRAY[]::uuid[]
      )
    )
  ) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_super_admin = true)
);

-- Budget
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.budget;
CREATE POLICY "Users can access budgets from accessible subsidiaries" 
ON public.budget FOR ALL 
USING (
  subsidiary_id = ANY(
    SELECT unnest(
      COALESCE(
        (SELECT subsidiary_access::uuid[] FROM public.profiles WHERE user_id = auth.uid()),
        ARRAY[]::uuid[]
      )
    )
  ) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_super_admin = true)
);

-- Create subsidiary context functions
CREATE OR REPLACE FUNCTION public.get_user_accessible_subsidiaries()
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subsidiary_list uuid[];
BEGIN
  SELECT COALESCE(subsidiary_access::uuid[], ARRAY[]::uuid[])
  INTO subsidiary_list
  FROM public.profiles
  WHERE user_id = auth.uid();
  
  RETURN subsidiary_list;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_default_subsidiary()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  default_sub uuid;
BEGIN
  SELECT default_subsidiary_id
  INTO default_sub
  FROM public.profiles
  WHERE user_id = auth.uid();
  
  RETURN default_sub;
END;
$$;

-- Add trigger for subsidiaries updated_at
CREATE TRIGGER update_subsidiaries_updated_at
BEFORE UPDATE ON public.subsidiaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();