-- Add missing fields for document management
ALTER TABLE vehicle_documents 
ADD COLUMN alert_days_before INTEGER DEFAULT 30,
ADD COLUMN remarks TEXT,
ADD COLUMN status TEXT DEFAULT 'valid';

-- Update existing records
UPDATE vehicle_documents SET 
  alert_days_before = 30,
  status = CASE 
    WHEN expiry_date < CURRENT_DATE THEN 'expired'
    WHEN expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
    WHEN expiry_date <= CURRENT_DATE + INTERVAL '90 days' THEN 'expiring'
    ELSE 'valid'
  END;

-- Create function to calculate document status
CREATE OR REPLACE FUNCTION calculate_document_status(expiry_date DATE)
RETURNS TEXT AS $$
BEGIN
  IF expiry_date IS NULL THEN
    RETURN 'unknown';
  ELSIF expiry_date < CURRENT_DATE THEN
    RETURN 'expired';
  ELSIF expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN
    RETURN 'expiring_soon';
  ELSIF expiry_date <= CURRENT_DATE + INTERVAL '90 days' THEN
    RETURN 'expiring';
  ELSE
    RETURN 'valid';
  END IF;
END;
$$ LANGUAGE plpgsql;