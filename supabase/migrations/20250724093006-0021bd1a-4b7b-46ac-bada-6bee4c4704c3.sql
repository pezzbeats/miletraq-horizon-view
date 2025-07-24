-- Create vehicle transfers table for cross-subsidiary operations
CREATE TABLE public.vehicle_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL,
  from_subsidiary_id UUID NOT NULL,
  to_subsidiary_id UUID NOT NULL,
  transfer_reason TEXT NOT NULL,
  effective_date DATE NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_by UUID NOT NULL,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  subsidiary_id UUID NOT NULL -- For RLS, tracks current owner
);

-- Enable Row Level Security
ALTER TABLE public.vehicle_transfers ENABLE ROW LEVEL SECURITY;

-- Create policies for vehicle transfers
CREATE POLICY "Users can access vehicle transfers from accessible subsidiaries" 
ON public.vehicle_transfers 
FOR SELECT 
USING ((subsidiary_id = ANY (get_user_accessible_subsidiaries())) OR is_user_super_admin());

CREATE POLICY "Users can create vehicle transfers" 
ON public.vehicle_transfers 
FOR INSERT 
WITH CHECK ((from_subsidiary_id = ANY (get_user_accessible_subsidiaries())) OR is_user_super_admin());

CREATE POLICY "Users can update vehicle transfers" 
ON public.vehicle_transfers 
FOR UPDATE 
USING ((subsidiary_id = ANY (get_user_accessible_subsidiaries())) OR is_user_super_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_vehicle_transfers_updated_at
BEFORE UPDATE ON public.vehicle_transfers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create budget transfers table for cross-subsidiary operations
CREATE TABLE public.budget_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_subsidiary_id UUID NOT NULL,
  to_subsidiary_id UUID NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  transfer_reason TEXT NOT NULL,
  effective_date DATE NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_by UUID NOT NULL,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  subsidiary_id UUID NOT NULL -- For RLS
);

-- Enable Row Level Security
ALTER TABLE public.budget_transfers ENABLE ROW LEVEL SECURITY;

-- Create policies for budget transfers
CREATE POLICY "Users can access budget transfers from accessible subsidiaries" 
ON public.budget_transfers 
FOR SELECT 
USING ((subsidiary_id = ANY (get_user_accessible_subsidiaries())) OR is_user_super_admin());

CREATE POLICY "Users can create budget transfers" 
ON public.budget_transfers 
FOR INSERT 
WITH CHECK ((from_subsidiary_id = ANY (get_user_accessible_subsidiaries())) OR is_user_super_admin());

CREATE POLICY "Users can update budget transfers" 
ON public.budget_transfers 
FOR UPDATE 
USING ((subsidiary_id = ANY (get_user_accessible_subsidiaries())) OR is_user_super_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_budget_transfers_updated_at
BEFORE UPDATE ON public.budget_transfers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle vehicle transfer completion
CREATE OR REPLACE FUNCTION public.complete_vehicle_transfer(transfer_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  transfer_record public.vehicle_transfers%ROWTYPE;
BEGIN
  -- Get the transfer record
  SELECT * INTO transfer_record
  FROM public.vehicle_transfers
  WHERE id = transfer_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update vehicle subsidiary
  UPDATE public.vehicles
  SET 
    subsidiary_id = transfer_record.to_subsidiary_id,
    updated_at = now()
  WHERE id = transfer_record.vehicle_id;
  
  -- Mark transfer as completed
  UPDATE public.vehicle_transfers
  SET 
    status = 'completed',
    completed_at = now(),
    updated_at = now()
  WHERE id = transfer_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;