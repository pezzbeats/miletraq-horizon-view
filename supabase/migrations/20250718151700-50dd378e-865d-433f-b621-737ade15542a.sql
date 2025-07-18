
-- Add GST fields to vendors table
ALTER TABLE vendors 
ADD COLUMN gst_number TEXT,
ADD COLUMN gst_registered BOOLEAN DEFAULT false,
ADD COLUMN default_gst_rate NUMERIC;

-- Add GST fields to maintenance_log table
ALTER TABLE maintenance_log 
ADD COLUMN is_gst_invoice BOOLEAN DEFAULT false,
ADD COLUMN gst_type TEXT CHECK (gst_type IN ('inclusive', 'exclusive')),
ADD COLUMN gst_rate NUMERIC,
ADD COLUMN labor_gst_amount NUMERIC DEFAULT 0,
ADD COLUMN labor_base_amount NUMERIC;

-- Add GST fields to maintenance_parts_used table
ALTER TABLE maintenance_parts_used 
ADD COLUMN is_gst_applicable BOOLEAN DEFAULT false,
ADD COLUMN gst_rate NUMERIC,
ADD COLUMN gst_amount NUMERIC DEFAULT 0,
ADD COLUMN base_cost NUMERIC;

-- Update existing records to have default values
UPDATE maintenance_log SET 
  is_gst_invoice = false,
  labor_gst_amount = 0,
  labor_base_amount = labor_cost
WHERE labor_base_amount IS NULL;

UPDATE maintenance_parts_used SET 
  is_gst_applicable = false,
  gst_amount = 0,
  base_cost = unit_cost
WHERE base_cost IS NULL;

UPDATE vendors SET 
  gst_registered = false
WHERE gst_registered IS NULL;
