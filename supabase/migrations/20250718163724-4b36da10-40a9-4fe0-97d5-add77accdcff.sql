-- Step 5: Update RLS policies for main tables to include subsidiary filtering
-- Vehicles
DROP POLICY IF EXISTS "Users can view vehicles from accessible subsidiaries" ON public.vehicles;
DROP POLICY IF EXISTS "Users can manage vehicles in accessible subsidiaries" ON public.vehicles;

CREATE POLICY "Users can access vehicles from accessible subsidiaries" 
ON public.vehicles FOR ALL 
USING (
  subsidiary_id = ANY(public.get_user_accessible_subsidiaries()) OR
  public.is_user_super_admin()
);

-- Drivers
DROP POLICY IF EXISTS "Users can view drivers from accessible subsidiaries" ON public.drivers;
DROP POLICY IF EXISTS "Users can manage drivers in accessible subsidiaries" ON public.drivers;

CREATE POLICY "Users can access drivers from accessible subsidiaries" 
ON public.drivers FOR ALL 
USING (
  subsidiary_id = ANY(public.get_user_accessible_subsidiaries()) OR
  public.is_user_super_admin()
);

-- Fuel Log
DROP POLICY IF EXISTS "Users can access fuel logs from accessible subsidiaries" ON public.fuel_log;

CREATE POLICY "Users can access fuel logs from accessible subsidiaries" 
ON public.fuel_log FOR ALL 
USING (
  subsidiary_id = ANY(public.get_user_accessible_subsidiaries()) OR
  public.is_user_super_admin()
);

-- Fuel Purchases
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.fuel_purchases;

CREATE POLICY "Users can access fuel purchases from accessible subsidiaries" 
ON public.fuel_purchases FOR ALL 
USING (
  subsidiary_id = ANY(public.get_user_accessible_subsidiaries()) OR
  public.is_user_super_admin()
);

-- Maintenance Log
DROP POLICY IF EXISTS "Users can access maintenance logs from accessible subsidiaries" ON public.maintenance_log;

CREATE POLICY "Users can access maintenance logs from accessible subsidiaries" 
ON public.maintenance_log FOR ALL 
USING (
  subsidiary_id = ANY(public.get_user_accessible_subsidiaries()) OR
  public.is_user_super_admin()
);

-- Vendors
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.vendors;

CREATE POLICY "Users can access vendors from accessible subsidiaries" 
ON public.vendors FOR ALL 
USING (
  subsidiary_id = ANY(public.get_user_accessible_subsidiaries()) OR
  public.is_user_super_admin()
);

-- Parts Master
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.parts_master;

CREATE POLICY "Users can access parts from accessible subsidiaries" 
ON public.parts_master FOR ALL 
USING (
  subsidiary_id = ANY(public.get_user_accessible_subsidiaries()) OR
  public.is_user_super_admin()
);

-- Maintenance Categories
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.maintenance_categories;

CREATE POLICY "Users can access categories from accessible subsidiaries" 
ON public.maintenance_categories FOR ALL 
USING (
  subsidiary_id = ANY(public.get_user_accessible_subsidiaries()) OR
  public.is_user_super_admin()
);

-- Vehicle Documents
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.vehicle_documents;

CREATE POLICY "Users can access vehicle documents from accessible subsidiaries" 
ON public.vehicle_documents FOR ALL 
USING (
  subsidiary_id = ANY(public.get_user_accessible_subsidiaries()) OR
  public.is_user_super_admin()
);

-- Budget
DROP POLICY IF EXISTS "Users can access budgets from accessible subsidiaries" ON public.budget;

CREATE POLICY "Users can access budgets from accessible subsidiaries" 
ON public.budget FOR ALL 
USING (
  subsidiary_id = ANY(public.get_user_accessible_subsidiaries()) OR
  public.is_user_super_admin()
);

-- Odometer Readings
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.odometer_readings;

CREATE POLICY "Users can access odometer readings from accessible subsidiaries" 
ON public.odometer_readings FOR ALL 
USING (
  subsidiary_id = ANY(public.get_user_accessible_subsidiaries()) OR
  public.is_user_super_admin()
);

-- Fuel Tank
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.fuel_tank;

CREATE POLICY "Users can access fuel tanks from accessible subsidiaries" 
ON public.fuel_tank FOR ALL 
USING (
  subsidiary_id = ANY(public.get_user_accessible_subsidiaries()) OR
  public.is_user_super_admin()
);