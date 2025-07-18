-- Create settings table for application configuration
CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all settings" 
ON public.app_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage all settings" 
ON public.app_settings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Managers can update general settings" 
ON public.app_settings 
FOR UPDATE 
USING (
  category IN ('general', 'fleet', 'notifications') AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('admin', 'manager')
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.app_settings (setting_key, setting_value, category, description) VALUES
-- General Settings
('app_name', '"MileTraq"', 'general', 'Application name'),
('company_name', '"Your Company"', 'general', 'Company or organization name'),
('default_currency', '"INR"', 'general', 'Default currency for the application'),
('date_format', '"DD/MM/YYYY"', 'general', 'Default date format'),
('time_format', '"24"', 'general', 'Time format (12 or 24 hour)'),

-- Theme Settings
('theme_mode', '"auto"', 'theme', 'Theme mode: light, dark, or auto'),
('dark_mode_start', '"19:00"', 'theme', 'Time when dark mode starts (if auto)'),
('light_mode_start', '"07:00"', 'theme', 'Time when light mode starts (if auto)'),
('primary_color', '"#2563eb"', 'theme', 'Primary brand color'),
('font_size', '"medium"', 'theme', 'Default font size'),
('compact_mode', 'false', 'theme', 'Enable compact/dense layouts'),

-- Fleet Settings
('default_tank_capacity', '3000', 'fleet', 'Default fuel tank capacity in liters'),
('low_fuel_threshold', '500', 'fleet', 'Low fuel alert threshold in liters'),
('default_fuel_type', '"diesel"', 'fleet', 'Default fuel type for new vehicles'),
('mileage_unit', '"km/L"', 'fleet', 'Mileage measurement unit'),
('distance_unit', '"kilometers"', 'fleet', 'Distance measurement unit'),
('document_alert_days', '30', 'fleet', 'Days before document expiry to show alerts'),

-- Notification Settings
('email_notifications', 'true', 'notifications', 'Enable email notifications'),
('document_expiry_alerts', 'true', 'notifications', 'Enable document expiry alerts'),
('budget_threshold_alerts', 'true', 'notifications', 'Enable budget threshold alerts'),
('low_fuel_alerts', 'true', 'notifications', 'Enable low fuel tank alerts'),
('maintenance_alerts', 'true', 'notifications', 'Enable maintenance due alerts'),

-- Security Settings
('session_timeout', '240', 'security', 'Session timeout in minutes'),
('min_password_length', '8', 'security', 'Minimum password length'),
('require_uppercase', 'true', 'security', 'Require uppercase letters in passwords'),
('require_numbers', 'true', 'security', 'Require numbers in passwords'),
('require_special_chars', 'true', 'security', 'Require special characters in passwords'),
('password_expiry_days', '0', 'security', 'Password expiry in days (0 = never)'),
('failed_login_limit', '5', 'security', 'Failed login attempts limit'),
('lockout_duration', '30', 'security', 'Account lockout duration in minutes'),

-- System Settings
('auto_backup_frequency', '"weekly"', 'system', 'Automatic backup frequency'),
('data_retention_period', '"2_years"', 'system', 'Data retention period'),
('export_format', '"excel"', 'system', 'Default export format'),
('enable_activity_logging', 'true', 'system', 'Enable activity logging'),
('log_retention_days', '90', 'system', 'Log retention period in days'),
('debug_mode', 'false', 'system', 'Enable debug mode'),
('maintenance_mode', 'false', 'system', 'Enable maintenance mode');

-- Create function to get setting by key
CREATE OR REPLACE FUNCTION public.get_setting(setting_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT setting_value INTO result
  FROM public.app_settings
  WHERE app_settings.setting_key = get_setting.setting_key;
  
  RETURN COALESCE(result, 'null'::jsonb);
END;
$$;

-- Create function to update setting
CREATE OR REPLACE FUNCTION public.update_setting(
  setting_key TEXT,
  setting_value JSONB,
  user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.app_settings
  SET 
    setting_value = update_setting.setting_value,
    updated_at = now(),
    updated_by = (SELECT id FROM public.profiles WHERE profiles.user_id = update_setting.user_id)
  WHERE app_settings.setting_key = update_setting.setting_key;
  
  RETURN FOUND;
END;
$$;