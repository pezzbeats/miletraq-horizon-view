-- Add multi-fuel support to vehicles table
ALTER TABLE vehicles 
ADD COLUMN fuel_types JSONB DEFAULT '["diesel"]'::jsonb,
ADD COLUMN tank_capacity_diesel NUMERIC,
ADD COLUMN tank_capacity_petrol NUMERIC, 
ADD COLUMN tank_capacity_cng NUMERIC,
ADD COLUMN default_fuel_type TEXT DEFAULT 'diesel';

-- Create enum for fuel types
CREATE TYPE fuel_type_enum AS ENUM ('diesel', 'petrol', 'cng');

-- Create enum for fuel units
CREATE TYPE fuel_unit_enum AS ENUM ('liters', 'kg');

-- Create new fuel_tanks table for multi-fuel tank management
CREATE TABLE fuel_tanks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subsidiary_id UUID NOT NULL,
  fuel_type fuel_type_enum NOT NULL,
  current_volume NUMERIC NOT NULL DEFAULT 0,
  capacity NUMERIC NOT NULL,
  low_threshold NUMERIC NOT NULL DEFAULT 500,
  unit fuel_unit_enum NOT NULL DEFAULT 'liters',
  tank_location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID NOT NULL
);

-- Enable RLS on fuel_tanks
ALTER TABLE fuel_tanks ENABLE ROW LEVEL SECURITY;

-- Create policies for fuel_tanks
CREATE POLICY "Users can access fuel tanks from accessible subsidiaries" 
ON fuel_tanks 
FOR ALL 
USING (subsidiary_id = ANY(get_user_accessible_subsidiaries()) OR is_user_super_admin());

-- Update fuel_purchases table for multi-fuel support
ALTER TABLE fuel_purchases 
ADD COLUMN fuel_type fuel_type_enum DEFAULT 'diesel',
ADD COLUMN unit fuel_unit_enum DEFAULT 'liters',
ADD COLUMN tank_id UUID REFERENCES fuel_tanks(id);

-- Update fuel_log table for multi-fuel support
ALTER TABLE fuel_log 
ADD COLUMN fuel_type fuel_type_enum DEFAULT 'diesel',
ADD COLUMN unit fuel_unit_enum DEFAULT 'liters';

-- Create trigger for updating fuel tank levels on purchases
CREATE OR REPLACE FUNCTION update_fuel_tank_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the specified fuel tank level
  UPDATE fuel_tanks 
  SET 
    current_volume = current_volume + NEW.volume,
    updated_at = now()
  WHERE id = NEW.tank_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fuel_purchase_tank_update
  AFTER INSERT ON fuel_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_fuel_tank_on_purchase();

-- Create trigger for updating fuel tank levels on consumption
CREATE OR REPLACE FUNCTION update_fuel_tank_on_consumption()
RETURNS TRIGGER AS $$
DECLARE
  tank_record fuel_tanks%ROWTYPE;
BEGIN
  -- Only update if fuel source is internal tank
  IF NEW.fuel_source = 'internal_tank' THEN
    -- Find the appropriate tank for this fuel type and subsidiary
    SELECT * INTO tank_record
    FROM fuel_tanks 
    WHERE fuel_type = NEW.fuel_type::fuel_type_enum 
      AND subsidiary_id = NEW.subsidiary_id 
      AND is_active = true
    LIMIT 1;
    
    IF FOUND THEN
      UPDATE fuel_tanks 
      SET 
        current_volume = current_volume - NEW.fuel_volume,
        updated_at = now()
      WHERE id = tank_record.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fuel_consumption_tank_update
  AFTER INSERT ON fuel_log
  FOR EACH ROW
  EXECUTE FUNCTION update_fuel_tank_on_consumption();

-- Create indexes for performance
CREATE INDEX idx_fuel_tanks_subsidiary_fuel_type ON fuel_tanks(subsidiary_id, fuel_type);
CREATE INDEX idx_fuel_purchases_fuel_type ON fuel_purchases(fuel_type);
CREATE INDEX idx_fuel_log_fuel_type ON fuel_log(fuel_type);
CREATE INDEX idx_vehicles_fuel_types ON vehicles USING GIN(fuel_types);

-- Insert default fuel tanks for existing subsidiaries
INSERT INTO fuel_tanks (subsidiary_id, fuel_type, capacity, low_threshold, unit, tank_location, created_by)
SELECT 
  id,
  'diesel'::fuel_type_enum,
  10000,
  1000,
  'liters'::fuel_unit_enum,
  'Main Storage',
  '00000000-0000-0000-0000-000000000000'
FROM subsidiaries
WHERE is_active = true;

-- Migrate existing fuel_tank data if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fuel_tank') THEN
    -- Migrate data from old fuel_tank table to new fuel_tanks table
    INSERT INTO fuel_tanks (subsidiary_id, fuel_type, current_volume, capacity, low_threshold, unit, created_by)
    SELECT 
      COALESCE(subsidiary_id, (SELECT id FROM subsidiaries LIMIT 1)),
      'diesel'::fuel_type_enum,
      current_level,
      capacity,
      COALESCE(low_level_threshold, 500),
      'liters'::fuel_unit_enum,
      updated_by
    FROM fuel_tank
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Update vehicles table fuel_type to use new enum structure  
UPDATE vehicles 
SET 
  fuel_types = CASE 
    WHEN fuel_type = 'diesel' THEN '["diesel"]'::jsonb
    WHEN fuel_type = 'petrol' THEN '["petrol"]'::jsonb
    WHEN fuel_type = 'cng' THEN '["cng"]'::jsonb
    ELSE '["diesel"]'::jsonb
  END,
  default_fuel_type = COALESCE(fuel_type::text, 'diesel'),
  tank_capacity_diesel = CASE WHEN fuel_type = 'diesel' THEN tank_capacity END,
  tank_capacity_petrol = CASE WHEN fuel_type = 'petrol' THEN tank_capacity END,
  tank_capacity_cng = CASE WHEN fuel_type = 'cng' THEN tank_capacity END
WHERE fuel_type IS NOT NULL;