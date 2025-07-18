-- Step 1: Create subsidiaries table and basic structure
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

-- Add trigger for subsidiaries updated_at
CREATE TRIGGER update_subsidiaries_updated_at
BEFORE UPDATE ON public.subsidiaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();