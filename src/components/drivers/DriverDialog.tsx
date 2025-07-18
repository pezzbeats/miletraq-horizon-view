import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type Driver = Tables<'drivers'>;

interface DriverDialogProps {
  driver: Driver | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

interface FormData {
  name: string;
  license_number: string;
  license_expiry: Date | undefined;
  phone: string;
  address: string;
  is_active: boolean;
}

interface FormErrors {
  name?: string;
  license_number?: string;
  license_expiry?: string;
  phone?: string;
}

export const DriverDialog: React.FC<DriverDialogProps> = ({
  driver,
  open,
  onOpenChange,
  onSave,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    license_number: '',
    license_expiry: undefined,
    phone: '',
    address: '',
    is_active: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (driver) {
      setFormData({
        name: driver.name || '',
        license_number: driver.license_number || '',
        license_expiry: driver.license_expiry ? new Date(driver.license_expiry) : undefined,
        phone: driver.phone || '',
        address: driver.address || '',
        is_active: driver.is_active ?? true,
      });
    } else {
      setFormData({
        name: '',
        license_number: '',
        license_expiry: undefined,
        phone: '',
        address: '',
        is_active: true,
      });
    }
    setErrors({});
  }, [driver, open]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Driver name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Driver name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = 'Driver name can only contain letters and spaces';
    }

    // License number validation
    if (!formData.license_number.trim()) {
      newErrors.license_number = 'License number is required';
    } else if (formData.license_number.trim().length < 5) {
      newErrors.license_number = 'License number must be at least 5 characters';
    }

    // License expiry validation
    if (!formData.license_expiry) {
      newErrors.license_expiry = 'License expiry date is required';
    } else if (!driver && formData.license_expiry < new Date()) {
      newErrors.license_expiry = 'License expiry date cannot be in the past for new drivers';
    }

    // Phone validation (Indian mobile format)
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneRegex = /^[6-9]\d{9}$/;
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.phone = 'Please enter a valid 10-digit Indian mobile number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkDuplicateLicense = async (licenseNumber: string): Promise<boolean> => {
    try {
      const query = supabase
        .from('drivers')
        .select('id')
        .eq('license_number', licenseNumber.trim());

      if (driver) {
        query.neq('id', driver.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('Error checking duplicate license:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Check for duplicate license number
      const isDuplicate = await checkDuplicateLicense(formData.license_number);
      if (isDuplicate) {
        setErrors({ license_number: 'This license number is already registered' });
        setLoading(false);
        return;
      }

      if (driver) {
        const updateData = {
          name: formData.name.trim(),
          license_number: formData.license_number.trim(),
          license_expiry: formData.license_expiry?.toISOString().split('T')[0],
          phone: formData.phone.replace(/\D/g, ''),
          address: formData.address.trim() || null,
          is_active: formData.is_active,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('drivers')
          .update(updateData)
          .eq('id', driver.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Driver updated successfully.",
        });
      } else {
        const insertData = {
          name: formData.name.trim(),
          license_number: formData.license_number.trim(),
          license_expiry: formData.license_expiry?.toISOString().split('T')[0],
          phone: formData.phone.replace(/\D/g, ''),
          address: formData.address.trim() || null,
          is_active: formData.is_active,
          created_by: user?.id!,
        };

        const { error } = await supabase
          .from('drivers')
          .insert([insertData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Driver added successfully.",
        });
      }

      onSave();
    } catch (error) {
      console.error('Error saving driver:', error);
      toast({
        title: "Error",
        description: "Failed to save driver. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned;
    }
    return cleaned.substring(0, 10);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {driver ? 'Edit Driver' : 'Add New Driver'}
          </DialogTitle>
          <DialogDescription>
            {driver 
              ? 'Update driver information and license details.'
              : 'Add a new driver to your fleet management system.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Driver Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter driver's full name"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="license_number">License Number *</Label>
            <Input
              id="license_number"
              value={formData.license_number}
              onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
              placeholder="Enter license number"
              className={errors.license_number ? 'border-destructive' : ''}
            />
            {errors.license_number && (
              <p className="text-sm text-destructive">{errors.license_number}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>License Expiry Date *</Label>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.license_expiry && "text-muted-foreground",
                    errors.license_expiry && "border-destructive"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.license_expiry ? (
                    format(formData.license_expiry, "PPP")
                  ) : (
                    <span>Pick license expiry date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.license_expiry}
                  onSelect={(date) => {
                    setFormData({ ...formData, license_expiry: date });
                    setDateOpen(false);
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            {errors.license_expiry && (
              <p className="text-sm text-destructive">{errors.license_expiry}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ 
                ...formData, 
                phone: formatPhoneNumber(e.target.value) 
              })}
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter driver's address (optional)"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Active Status</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : driver ? 'Update Driver' : 'Add Driver'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};