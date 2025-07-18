-- Enhance budget table for comprehensive budget management
ALTER TABLE budget 
DROP COLUMN year,
DROP COLUMN month,
ADD COLUMN time_period TEXT CHECK (time_period IN ('monthly', 'quarterly', 'yearly')) NOT NULL DEFAULT 'monthly',
ADD COLUMN period_start DATE NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN period_end DATE NOT NULL DEFAULT CURRENT_DATE + INTERVAL '1 month',
ADD COLUMN description TEXT,
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
ADD COLUMN variance_percentage NUMERIC DEFAULT 0,
ADD COLUMN remaining_amount NUMERIC DEFAULT 0;

-- Create function to calculate actual spending for budget categories
CREATE OR REPLACE FUNCTION calculate_actual_spending(
  p_category TEXT,
  p_start_date DATE,
  p_end_date DATE
) RETURNS NUMERIC AS $$
DECLARE
  total_spent NUMERIC := 0;
BEGIN
  CASE p_category
    WHEN 'fuel' THEN
      -- Sum from fuel_log and fuel_purchases
      SELECT COALESCE(
        (SELECT SUM(total_cost) FROM fuel_log 
         WHERE date BETWEEN p_start_date AND p_end_date),
        0
      ) + COALESCE(
        (SELECT SUM(total_cost) FROM fuel_purchases 
         WHERE purchase_date BETWEEN p_start_date AND p_end_date),
        0
      ) INTO total_spent;
      
    WHEN 'maintenance' THEN
      -- Sum from maintenance_log
      SELECT COALESCE(SUM(total_cost), 0) INTO total_spent
      FROM maintenance_log 
      WHERE maintenance_date BETWEEN p_start_date AND p_end_date;
      
    WHEN 'parts' THEN
      -- Sum from maintenance_parts_used for the period
      SELECT COALESCE(SUM(mpu.total_cost), 0) INTO total_spent
      FROM maintenance_parts_used mpu
      JOIN maintenance_log ml ON mpu.maintenance_id = ml.id
      WHERE ml.maintenance_date BETWEEN p_start_date AND p_end_date;
      
    ELSE
      total_spent := 0;
  END CASE;
  
  RETURN total_spent;
END;
$$ LANGUAGE plpgsql;

-- Create function to update budget calculations
CREATE OR REPLACE FUNCTION update_budget_calculations()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate actual amount
  NEW.actual_amount := calculate_actual_spending(
    NEW.category, 
    NEW.period_start, 
    NEW.period_end
  );
  
  -- Calculate remaining amount
  NEW.remaining_amount := NEW.budgeted_amount - NEW.actual_amount;
  
  -- Calculate variance percentage
  IF NEW.budgeted_amount > 0 THEN
    NEW.variance_percentage := ((NEW.actual_amount - NEW.budgeted_amount) / NEW.budgeted_amount) * 100;
  ELSE
    NEW.variance_percentage := 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update budget calculations
CREATE TRIGGER trigger_update_budget_calculations
BEFORE INSERT OR UPDATE ON budget
FOR EACH ROW
EXECUTE FUNCTION update_budget_calculations();

-- Update existing records with default values
UPDATE budget SET 
  time_period = 'monthly',
  period_start = CURRENT_DATE,
  period_end = CURRENT_DATE + INTERVAL '1 month',
  status = 'active'
WHERE time_period IS NULL;