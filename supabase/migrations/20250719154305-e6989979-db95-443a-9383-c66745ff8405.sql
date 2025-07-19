-- Create enums for service tickets
CREATE TYPE public.ticket_priority AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE public.ticket_urgency AS ENUM ('immediate', 'within_24h', 'within_week', 'scheduled');
CREATE TYPE public.ticket_status AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.ticket_type AS ENUM ('breakdown', 'preventive', 'scheduled');
CREATE TYPE public.approval_action AS ENUM ('approve', 'approve_with_modifications', 'request_info', 'reject');

-- Create service_tickets table
CREATE TABLE public.service_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT NOT NULL UNIQUE,
  vehicle_id UUID NOT NULL,
  created_by UUID NOT NULL,
  subsidiary_id UUID NOT NULL,
  
  -- Ticket details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  ticket_type ticket_type NOT NULL DEFAULT 'breakdown',
  priority ticket_priority NOT NULL DEFAULT 'medium',
  urgency ticket_urgency NOT NULL DEFAULT 'within_week',
  status ticket_status NOT NULL DEFAULT 'draft',
  
  -- Cost estimation
  estimated_labor_hours NUMERIC(10,2),
  estimated_labor_rate NUMERIC(10,2),
  estimated_labor_cost NUMERIC(10,2),
  estimated_parts_cost NUMERIC(10,2),
  estimated_total_cost NUMERIC(10,2),
  
  -- Scheduling
  requested_completion_date DATE,
  scheduled_date DATE,
  scheduled_time TIME,
  assigned_vendor_id UUID,
  
  -- Actual costs (filled when work is completed)
  actual_labor_cost NUMERIC(10,2),
  actual_parts_cost NUMERIC(10,2),
  actual_total_cost NUMERIC(10,2),
  
  -- Work details
  work_started_at TIMESTAMP WITH TIME ZONE,
  work_completed_at TIMESTAMP WITH TIME ZONE,
  completion_notes TEXT,
  
  -- Maintenance log linkage
  maintenance_log_id UUID,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create service_ticket_approvals table
CREATE TABLE public.service_ticket_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL,
  subsidiary_id UUID NOT NULL,
  
  action approval_action NOT NULL,
  comments TEXT,
  modifications TEXT, -- JSON string for any modifications made during approval
  
  -- Modified cost limits (if approve_with_modifications)
  modified_labor_cost_limit NUMERIC(10,2),
  modified_parts_cost_limit NUMERIC(10,2),
  modified_total_cost_limit NUMERIC(10,2),
  
  -- Modified scheduling (if approve_with_modifications)
  modified_completion_date DATE,
  modified_vendor_id UUID,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service_ticket_attachments table
CREATE TABLE public.service_ticket_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create maintenance_rules table for scheduled maintenance
CREATE TABLE public.maintenance_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subsidiary_id UUID NOT NULL,
  
  -- Rule definition
  rule_name TEXT NOT NULL,
  description TEXT,
  vehicle_types TEXT[], -- Array of vehicle types this rule applies to
  
  -- Trigger conditions
  mileage_interval INTEGER, -- Trigger every X kilometers
  time_interval_days INTEGER, -- Trigger every X days
  rule_logic TEXT NOT NULL DEFAULT 'OR', -- 'OR' or 'AND' - how to combine mileage and time
  
  -- Maintenance details
  maintenance_type TEXT NOT NULL,
  estimated_duration_hours NUMERIC(4,2),
  estimated_cost NUMERIC(10,2),
  required_parts JSONB, -- JSON array of typical parts needed
  
  -- Advance warning
  advance_warning_days INTEGER DEFAULT 7,
  advance_warning_km INTEGER DEFAULT 500,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scheduled_maintenance_alerts table
CREATE TABLE public.scheduled_maintenance_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL,
  maintenance_rule_id UUID NOT NULL REFERENCES maintenance_rules(id) ON DELETE CASCADE,
  subsidiary_id UUID NOT NULL,
  
  -- Alert details
  alert_type TEXT NOT NULL DEFAULT 'upcoming', -- 'upcoming', 'due', 'overdue'
  due_date DATE,
  due_mileage INTEGER,
  current_mileage INTEGER,
  days_remaining INTEGER,
  km_remaining INTEGER,
  
  -- Status
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  
  -- Auto-ticket creation
  auto_ticket_created BOOLEAN DEFAULT false,
  created_ticket_id UUID REFERENCES service_tickets(id),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service_ticket_comments table for communication
CREATE TABLE public.service_ticket_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment_text TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- Internal comments vs customer-facing
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.service_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_ticket_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_maintenance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_ticket_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for service_tickets
CREATE POLICY "Users can access service tickets from accessible subsidiaries" 
ON public.service_tickets 
FOR ALL 
USING (subsidiary_id = ANY(get_user_accessible_subsidiaries()) OR is_user_super_admin());

-- Create RLS policies for service_ticket_approvals
CREATE POLICY "Users can access approvals from accessible subsidiaries" 
ON public.service_ticket_approvals 
FOR ALL 
USING (subsidiary_id = ANY(get_user_accessible_subsidiaries()) OR is_user_super_admin());

-- Create RLS policies for service_ticket_attachments
CREATE POLICY "Users can access attachments for accessible tickets" 
ON public.service_ticket_attachments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM service_tickets st 
    WHERE st.id = ticket_id 
    AND (st.subsidiary_id = ANY(get_user_accessible_subsidiaries()) OR is_user_super_admin())
  )
);

-- Create RLS policies for maintenance_rules
CREATE POLICY "Users can access rules from accessible subsidiaries" 
ON public.maintenance_rules 
FOR ALL 
USING (subsidiary_id = ANY(get_user_accessible_subsidiaries()) OR is_user_super_admin());

-- Create RLS policies for scheduled_maintenance_alerts
CREATE POLICY "Users can access alerts from accessible subsidiaries" 
ON public.scheduled_maintenance_alerts 
FOR ALL 
USING (subsidiary_id = ANY(get_user_accessible_subsidiaries()) OR is_user_super_admin());

-- Create RLS policies for service_ticket_comments
CREATE POLICY "Users can access comments for accessible tickets" 
ON public.service_ticket_comments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM service_tickets st 
    WHERE st.id = ticket_id 
    AND (st.subsidiary_id = ANY(get_user_accessible_subsidiaries()) OR is_user_super_admin())
  )
);

-- Create indexes for performance
CREATE INDEX idx_service_tickets_vehicle_id ON service_tickets(vehicle_id);
CREATE INDEX idx_service_tickets_subsidiary_id ON service_tickets(subsidiary_id);
CREATE INDEX idx_service_tickets_status ON service_tickets(status);
CREATE INDEX idx_service_tickets_created_by ON service_tickets(created_by);
CREATE INDEX idx_service_tickets_assigned_vendor ON service_tickets(assigned_vendor_id);

CREATE INDEX idx_ticket_approvals_ticket_id ON service_ticket_approvals(ticket_id);
CREATE INDEX idx_ticket_approvals_approver_id ON service_ticket_approvals(approver_id);

CREATE INDEX idx_maintenance_rules_subsidiary_id ON maintenance_rules(subsidiary_id);
CREATE INDEX idx_maintenance_rules_active ON maintenance_rules(is_active);

CREATE INDEX idx_scheduled_alerts_vehicle_id ON scheduled_maintenance_alerts(vehicle_id);
CREATE INDEX idx_scheduled_alerts_rule_id ON scheduled_maintenance_alerts(maintenance_rule_id);
CREATE INDEX idx_scheduled_alerts_due_date ON scheduled_maintenance_alerts(due_date);

-- Create triggers for updated_at
CREATE TRIGGER update_service_tickets_updated_at
  BEFORE UPDATE ON service_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_rules_updated_at
  BEFORE UPDATE ON maintenance_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_alerts_updated_at
  BEFORE UPDATE ON scheduled_maintenance_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_number INTEGER;
  ticket_number TEXT;
BEGIN
  -- Get the next sequence number for this year
  SELECT COALESCE(MAX(
    CASE 
      WHEN ticket_number ~ '^ST-' || EXTRACT(YEAR FROM NOW()) || '-[0-9]+$' 
      THEN CAST(SPLIT_PART(ticket_number, '-', 3) AS INTEGER)
      ELSE 0
    END
  ), 0) + 1
  INTO next_number
  FROM service_tickets;
  
  -- Format: ST-YYYY-NNNN
  ticket_number := 'ST-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(next_number::TEXT, 4, '0');
  
  RETURN ticket_number;
END;
$$;

-- Function to update maintenance log with service ticket link
CREATE OR REPLACE FUNCTION link_maintenance_to_ticket()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If maintenance_log is being created and has a service_ticket_id custom field,
  -- update the corresponding service ticket
  IF TG_OP = 'INSERT' AND NEW.description LIKE '%[ST-%' THEN
    -- Extract ticket number from description and update ticket
    UPDATE service_tickets 
    SET 
      maintenance_log_id = NEW.id,
      status = 'in_progress',
      work_started_at = COALESCE(work_started_at, NOW()),
      actual_labor_cost = NEW.labor_cost,
      actual_total_cost = NEW.total_cost
    WHERE ticket_number = (
      SELECT SUBSTRING(NEW.description FROM '\[ST-[0-9]{4}-[0-9]{4}\]')
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to link maintenance logs to service tickets
CREATE TRIGGER link_maintenance_to_service_ticket
  AFTER INSERT ON maintenance_log
  FOR EACH ROW
  EXECUTE FUNCTION link_maintenance_to_ticket();

-- Function to check and create scheduled maintenance alerts
CREATE OR REPLACE FUNCTION check_scheduled_maintenance()
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  vehicle_record RECORD;
  rule_record RECORD;
  current_mileage INTEGER;
  last_service_date DATE;
  last_service_mileage INTEGER;
  due_by_mileage BOOLEAN;
  due_by_date BOOLEAN;
  should_alert BOOLEAN;
BEGIN
  -- Loop through all active vehicles
  FOR vehicle_record IN 
    SELECT v.* FROM vehicles v 
    WHERE v.status = 'active'
  LOOP
    -- Get current mileage from latest fuel log or odometer reading
    SELECT COALESCE(
      (SELECT odometer_reading FROM fuel_log 
       WHERE vehicle_id = vehicle_record.id 
       ORDER BY date DESC, created_at DESC LIMIT 1),
      (SELECT odometer_reading FROM odometer_readings 
       WHERE vehicle_id = vehicle_record.id 
       ORDER BY reading_date DESC, created_at DESC LIMIT 1),
      0
    ) INTO current_mileage;
    
    -- Loop through applicable maintenance rules
    FOR rule_record IN 
      SELECT mr.* FROM maintenance_rules mr 
      WHERE mr.subsidiary_id = vehicle_record.subsidiary_id 
      AND mr.is_active = true
      AND (mr.vehicle_types IS NULL OR vehicle_record.make = ANY(mr.vehicle_types))
    LOOP
      -- Get last service of this type
      SELECT 
        ml.maintenance_date,
        ml.odometer_reading
      INTO last_service_date, last_service_mileage
      FROM maintenance_log ml
      WHERE ml.vehicle_id = vehicle_record.id
      AND ml.maintenance_type = rule_record.maintenance_type::maintenance_type
      ORDER BY ml.maintenance_date DESC, ml.created_at DESC
      LIMIT 1;
      
      -- Check if due by mileage
      due_by_mileage := false;
      IF rule_record.mileage_interval IS NOT NULL AND last_service_mileage IS NOT NULL THEN
        due_by_mileage := (current_mileage - last_service_mileage) >= rule_record.mileage_interval;
      END IF;
      
      -- Check if due by date
      due_by_date := false;
      IF rule_record.time_interval_days IS NOT NULL AND last_service_date IS NOT NULL THEN
        due_by_date := (CURRENT_DATE - last_service_date) >= rule_record.time_interval_days;
      END IF;
      
      -- Determine if should alert based on rule logic
      should_alert := false;
      IF rule_record.rule_logic = 'OR' THEN
        should_alert := due_by_mileage OR due_by_date;
      ELSE -- 'AND'
        should_alert := due_by_mileage AND due_by_date;
      END IF;
      
      -- Create alert if needed and doesn't already exist
      IF should_alert THEN
        INSERT INTO scheduled_maintenance_alerts (
          vehicle_id,
          maintenance_rule_id,
          subsidiary_id,
          alert_type,
          due_date,
          due_mileage,
          current_mileage,
          days_remaining,
          km_remaining
        )
        SELECT 
          vehicle_record.id,
          rule_record.id,
          vehicle_record.subsidiary_id,
          CASE 
            WHEN (CURRENT_DATE - COALESCE(last_service_date, CURRENT_DATE)) > rule_record.time_interval_days THEN 'overdue'
            ELSE 'due'
          END,
          COALESCE(last_service_date, CURRENT_DATE) + rule_record.time_interval_days,
          COALESCE(last_service_mileage, 0) + rule_record.mileage_interval,
          current_mileage,
          GREATEST(0, rule_record.time_interval_days - (CURRENT_DATE - COALESCE(last_service_date, CURRENT_DATE))),
          GREATEST(0, rule_record.mileage_interval - (current_mileage - COALESCE(last_service_mileage, 0)))
        WHERE NOT EXISTS (
          SELECT 1 FROM scheduled_maintenance_alerts sma
          WHERE sma.vehicle_id = vehicle_record.id
          AND sma.maintenance_rule_id = rule_record.id
          AND sma.is_acknowledged = false
        );
      END IF;
    END LOOP;
  END LOOP;
END;
$$;