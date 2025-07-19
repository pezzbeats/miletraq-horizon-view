-- Add new columns to fuel_log table for dual fuel operations
ALTER TABLE fuel_log ADD COLUMN IF NOT EXISTS fuel_source_type VARCHAR(20) CHECK (fuel_source_type IN ('internal_tank', 'external_vendor'));
ALTER TABLE fuel_log ADD COLUMN IF NOT EXISTS internal_tank_id UUID REFERENCES fuel_tanks(id);
ALTER TABLE fuel_log ADD COLUMN IF NOT EXISTS tank_level_before DECIMAL(10,2);
ALTER TABLE fuel_log ADD COLUMN IF NOT EXISTS tank_level_after DECIMAL(10,2);

-- Create internal tank transactions table
CREATE TABLE IF NOT EXISTS internal_tank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tank_id UUID REFERENCES fuel_tanks(id) NOT NULL,
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('purchase', 'dispensed', 'adjustment')) NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id), -- NULL for purchases
    fuel_log_id UUID REFERENCES fuel_log(id), -- NULL for purchases
    quantity DECIMAL(10,2) NOT NULL,
    unit fuel_unit_enum DEFAULT 'liters',
    cost_per_unit DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    vendor_id UUID REFERENCES vendors(id), -- For purchases only
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    level_before DECIMAL(10,2),
    level_after DECIMAL(10,2),
    remarks TEXT,
    created_by UUID REFERENCES profiles(id) NOT NULL,
    subsidiary_id UUID REFERENCES subsidiaries(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on internal_tank_transactions
ALTER TABLE internal_tank_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for internal_tank_transactions
CREATE POLICY "Users can access tank transactions from accessible subsidiaries" 
ON internal_tank_transactions 
FOR ALL 
USING ((subsidiary_id = ANY (get_user_accessible_subsidiaries())) OR is_user_super_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_internal_tank_transactions_updated_at
BEFORE UPDATE ON internal_tank_transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Update existing fuel_log records to set default fuel_source_type
UPDATE fuel_log 
SET fuel_source_type = CASE 
  WHEN fuel_source = 'internal_tank' THEN 'internal_tank'
  ELSE 'external_vendor'
END
WHERE fuel_source_type IS NULL;

-- Create function to update tank levels on dispensing
CREATE OR REPLACE FUNCTION update_tank_on_dispensing()
RETURNS TRIGGER AS $$
DECLARE
  tank_record fuel_tanks%ROWTYPE;
  new_level DECIMAL(10,2);
BEGIN
  -- Only process if fuel source is internal tank and it's diesel
  IF NEW.fuel_source_type = 'internal_tank' AND NEW.fuel_type = 'diesel' THEN
    -- Get the tank record
    SELECT * INTO tank_record
    FROM fuel_tanks 
    WHERE id = NEW.internal_tank_id 
      AND fuel_type = 'diesel'
      AND is_active = true;
    
    IF FOUND THEN
      -- Set tank levels in fuel_log
      NEW.tank_level_before := tank_record.current_volume;
      new_level := tank_record.current_volume - NEW.fuel_volume;
      NEW.tank_level_after := new_level;
      
      -- Update tank current volume
      UPDATE fuel_tanks 
      SET 
        current_volume = new_level,
        updated_at = now()
      WHERE id = tank_record.id;
      
      -- Insert transaction record
      INSERT INTO internal_tank_transactions (
        tank_id,
        transaction_type,
        vehicle_id,
        fuel_log_id,
        quantity,
        unit,
        level_before,
        level_after,
        remarks,
        created_by,
        subsidiary_id
      ) VALUES (
        tank_record.id,
        'dispensed',
        NEW.vehicle_id,
        NEW.id,
        NEW.fuel_volume,
        NEW.unit,
        tank_record.current_volume,
        new_level,
        'Fuel dispensed to vehicle',
        NEW.created_by,
        NEW.subsidiary_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tank dispensing
DROP TRIGGER IF EXISTS trigger_update_tank_on_dispensing ON fuel_log;
CREATE TRIGGER trigger_update_tank_on_dispensing
AFTER INSERT ON fuel_log
FOR EACH ROW
EXECUTE FUNCTION update_tank_on_dispensing();

-- Create function to record tank purchases
CREATE OR REPLACE FUNCTION record_tank_purchase()
RETURNS TRIGGER AS $$
DECLARE
  tank_record fuel_tanks%ROWTYPE;
  new_level DECIMAL(10,2);
BEGIN
  -- Get the tank record
  SELECT * INTO tank_record
  FROM fuel_tanks 
  WHERE id = NEW.tank_id;
  
  IF FOUND THEN
    -- Calculate new level
    new_level := tank_record.current_volume + NEW.volume;
    
    -- Update tank current volume
    UPDATE fuel_tanks 
    SET 
      current_volume = new_level,
      updated_at = now()
    WHERE id = tank_record.id;
    
    -- Insert transaction record
    INSERT INTO internal_tank_transactions (
      tank_id,
      transaction_type,
      quantity,
      unit,
      cost_per_unit,
      total_cost,
      vendor_id,
      level_before,
      level_after,
      remarks,
      created_by,
      subsidiary_id
    ) VALUES (
      tank_record.id,
      'purchase',
      NEW.volume,
      NEW.unit,
      NEW.rate_per_liter,
      NEW.total_cost,
      NEW.vendor_id,
      tank_record.current_volume,
      new_level,
      'Tank refill purchase',
      NEW.created_by,
      NEW.subsidiary_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tank purchases
DROP TRIGGER IF EXISTS trigger_record_tank_purchase ON fuel_purchases;
CREATE TRIGGER trigger_record_tank_purchase
AFTER INSERT ON fuel_purchases
FOR EACH ROW
EXECUTE FUNCTION record_tank_purchase();