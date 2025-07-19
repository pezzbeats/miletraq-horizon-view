import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CalendarIcon, ChevronDown, Check } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { useSubsidiary } from '@/contexts/SubsidiaryContext';

type Vehicle = Tables<'vehicles'>;
type Driver = Tables<'drivers'>;
type Subsidiary = Tables<'subsidiaries'>;

const fuelTypes = [
  { value: 'diesel', label: 'Diesel' },
  { value: 'petrol', label: 'Petrol' },
  { value: 'cng', label: 'CNG' },
  { value: 'electric', label: 'Electric' },
];

const vehicleStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'sold', label: 'Sold' },
];

const currentYear = new Date().getFullYear();

const vehicleSchema = z.object({
  vehicle_name: z.string().min(1, 'Vehicle name is required').max(20, 'Vehicle name must be under 20 characters'),
  subsidiary_id: z.string().min(1, 'Subsidiary is required'),
  vehicle_number: z.string().min(1, 'Vehicle number is required'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1990).max(currentYear + 1).optional(),
  fuel_types: z.array(z.enum(['diesel', 'petrol', 'cng', 'electric'])).min(1, 'At least one fuel type is required'),
  default_fuel_type: z.enum(['diesel', 'petrol', 'cng', 'electric']),
  default_driver_id: z.string().optional(),
  tank_capacity_diesel: z.number().min(0).optional(),
  tank_capacity_petrol: z.number().min(0).optional(),
  tank_capacity_cng: z.number().min(0).optional(),
  purchase_date: z.date().optional(),
  status: z.enum(['active', 'inactive', 'maintenance', 'sold']).default('active'),
  insurance_expiry: z.date().optional(),
  rc_expiry: z.date().optional(),
  puc_expiry: z.date().optional(),
  permit_expiry: z.date().optional(),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface VehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: Vehicle | null;
  onSuccess: () => void;
}

export const VehicleDialog: React.FC<VehicleDialogProps> = ({
  open,
  onOpenChange,
  vehicle,
  onSuccess,
}) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
  const [loading, setLoading] = useState(false);
  const [driverComboOpen, setDriverComboOpen] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const { currentSubsidiary } = useSubsidiary();

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      status: 'active',
      fuel_types: ['diesel'],
      default_fuel_type: 'diesel',
      subsidiary_id: currentSubsidiary?.id || '',
    },
  });

  useEffect(() => {
    if (open) {
      fetchDrivers();
      fetchSubsidiaries();
      if (vehicle) {
        // Populate form with vehicle data
        form.reset({
          vehicle_name: vehicle.vehicle_name || '',
          subsidiary_id: vehicle.subsidiary_id || currentSubsidiary?.id || '',
          vehicle_number: vehicle.vehicle_number,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year || undefined,
          fuel_types: (vehicle.fuel_types && Array.isArray(vehicle.fuel_types) ? vehicle.fuel_types : ['diesel']) as ('diesel' | 'petrol' | 'cng' | 'electric')[],
          default_fuel_type: (vehicle.default_fuel_type || vehicle.fuel_type) as any,
          default_driver_id: vehicle.default_driver_id || undefined,
          tank_capacity_diesel: vehicle.tank_capacity_diesel || undefined,
          tank_capacity_petrol: vehicle.tank_capacity_petrol || undefined,
          tank_capacity_cng: vehicle.tank_capacity_cng || undefined,
          purchase_date: vehicle.purchase_date ? new Date(vehicle.purchase_date) : undefined,
          status: (vehicle.status as any) || 'active',
          insurance_expiry: vehicle.insurance_expiry ? new Date(vehicle.insurance_expiry) : undefined,
          rc_expiry: vehicle.rc_expiry ? new Date(vehicle.rc_expiry) : undefined,
          puc_expiry: vehicle.puc_expiry ? new Date(vehicle.puc_expiry) : undefined,
          permit_expiry: vehicle.permit_expiry ? new Date(vehicle.permit_expiry) : undefined,
        });
      } else {
        form.reset({
          status: 'active',
          fuel_types: ['diesel'],
          default_fuel_type: 'diesel',
          subsidiary_id: currentSubsidiary?.id || '',
        });
      }
    }
  }, [open, vehicle, form, currentSubsidiary]);

  const fetchDrivers = async () => {
    try {
      const selectedSubsidiaryId = form.watch('subsidiary_id') || currentSubsidiary?.id;
      if (!selectedSubsidiaryId) return;

      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('is_active', true)
        .eq('subsidiary_id', selectedSubsidiaryId)
        .order('name');

      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load drivers.',
        variant: 'destructive',
      });
    }
  };

  const fetchSubsidiaries = async () => {
    try {
      let query = supabase
        .from('subsidiaries')
        .select('*')
        .eq('is_active', true)
        .order('subsidiary_name');

      // If not super admin, filter by accessible subsidiaries
      if (!profile?.is_super_admin) {
        const accessibleSubsidiaryIds = profile?.subsidiary_access as string[] || [];
        if (accessibleSubsidiaryIds.length > 0) {
          query = query.in('id', accessibleSubsidiaryIds);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      setSubsidiaries(data || []);
    } catch (error) {
      console.error('Error fetching subsidiaries:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subsidiaries.',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (data: VehicleFormData) => {
    if (!user) return;

    try {
      setLoading(true);

      // Check for duplicate vehicle number (excluding current vehicle if editing)
      const { data: existingVehicle, error: checkError } = await supabase
        .from('vehicles')
        .select('id')
        .eq('vehicle_number', data.vehicle_number)
        .neq('id', vehicle?.id || '');

      if (checkError) throw checkError;

      if (existingVehicle && existingVehicle.length > 0) {
        form.setError('vehicle_number', {
          message: 'Vehicle number already exists',
        });
        return;
      }

      // Check for duplicate vehicle name within subsidiary
      const { data: existingName, error: nameCheckError } = await supabase
        .from('vehicles')
        .select('id')
        .eq('vehicle_name', data.vehicle_name)
        .eq('subsidiary_id', data.subsidiary_id)
        .neq('id', vehicle?.id || '');

      if (nameCheckError) throw nameCheckError;

      if (existingName && existingName.length > 0) {
        form.setError('vehicle_name', {
          message: 'Vehicle name already exists in this subsidiary',
        });
        return;
      }

      const vehicleData = {
        vehicle_name: data.vehicle_name,
        subsidiary_id: data.subsidiary_id,
        vehicle_number: data.vehicle_number,
        make: data.make,
        model: data.model,
        year: data.year || null,
        fuel_types: data.fuel_types,
        default_fuel_type: data.default_fuel_type,
        fuel_type: data.default_fuel_type, // Keep for backward compatibility
        default_driver_id: data.default_driver_id || null,
        tank_capacity_diesel: data.tank_capacity_diesel || null,
        tank_capacity_petrol: data.tank_capacity_petrol || null,
        tank_capacity_cng: data.tank_capacity_cng || null,
        tank_capacity: data.tank_capacity_diesel || data.tank_capacity_petrol || data.tank_capacity_cng || null, // Primary tank capacity
        status: data.status,
        purchase_date: data.purchase_date?.toISOString().split('T')[0] || null,
        insurance_expiry: data.insurance_expiry?.toISOString().split('T')[0] || null,
        rc_expiry: data.rc_expiry?.toISOString().split('T')[0] || null,
        puc_expiry: data.puc_expiry?.toISOString().split('T')[0] || null,
        permit_expiry: data.permit_expiry?.toISOString().split('T')[0] || null,
        created_by: user.id,
      };

      let error;

      if (vehicle) {
        // Update existing vehicle
        const { error: updateError } = await supabase
          .from('vehicles')
          .update(vehicleData)
          .eq('id', vehicle.id);
        error = updateError;
      } else {
        // Create new vehicle
        const { error: insertError } = await supabase
          .from('vehicles')
          .insert([vehicleData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Vehicle ${vehicle ? 'updated' : 'created'} successfully.`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      toast({
        title: 'Error',
        description: error.message || `Failed to ${vehicle ? 'update' : 'create'} vehicle.`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedDriver = drivers.find(d => d.id === form.watch('default_driver_id'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {vehicle ? `Edit Vehicle: ${vehicle.vehicle_name || vehicle.vehicle_number}` : 'Add New Vehicle'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Configure vehicle details and subsidiary assignment
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vehicle Name */}
              <FormField
                control={form.control}
                name="vehicle_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., S-1, M-5, C-3, EECO" {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Short identifier used for daily operations
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Subsidiary */}
              <FormField
                control={form.control}
                name="subsidiary_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subsidiary *</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Clear driver selection when subsidiary changes
                        form.setValue('default_driver_id', undefined);
                        // Refetch drivers for new subsidiary
                        fetchDrivers();
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subsidiary" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subsidiaries.map((subsidiary) => (
                          <SelectItem key={subsidiary.id} value={subsidiary.id}>
                            {subsidiary.subsidiary_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Vehicle Number */}
              <FormField
                control={form.control}
                name="vehicle_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="UK18PA0049" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Make */}
              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make *</FormLabel>
                    <FormControl>
                      <Input placeholder="Mahindra" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Model */}
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model *</FormLabel>
                    <FormControl>
                      <Input placeholder="Bolero" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Year */}
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="2023"
                        min={1990}
                        max={currentYear + 1}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value) : undefined;
                          field.onChange(value);
                        }}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fuel Types */}
              <FormField
                control={form.control}
                name="fuel_types"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supported Fuel Types *</FormLabel>
                    <div className="space-y-2">
                      {fuelTypes.map((type) => (
                        <div key={type.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`fuel-${type.value}`}
                            checked={field.value?.includes(type.value as any) || false}
                            onChange={(e) => {
                              const currentValues = field.value || [];
                              if (e.target.checked) {
                                field.onChange([...currentValues, type.value as any]);
                              } else {
                                field.onChange(currentValues.filter(v => v !== type.value));
                              }
                            }}
                            className="h-4 w-4"
                          />
                          <label htmlFor={`fuel-${type.value}`} className="text-sm font-medium">
                            {type.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Default Fuel Type */}
              <FormField
                control={form.control}
                name="default_fuel_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Fuel Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select primary fuel type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fuelTypes
                          .filter(type => form.watch('fuel_types')?.includes(type.value as any))
                          .map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Default Driver */}
              <FormField
                control={form.control}
                name="default_driver_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Default Driver</FormLabel>
                    <Popover open={driverComboOpen} onOpenChange={setDriverComboOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            disabled={!form.watch('subsidiary_id')}
                            className={cn(
                              "justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {selectedDriver ? selectedDriver.name : "Select driver"}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search drivers..." />
                          <CommandList>
                            <CommandEmpty>
                              {form.watch('subsidiary_id') 
                                ? "No drivers found in this subsidiary." 
                                : "Please select a subsidiary first."
                              }
                            </CommandEmpty>
                            <CommandGroup>
                              <CommandItem
                                value=""
                                onSelect={() => {
                                  field.onChange(undefined);
                                  setDriverComboOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    !field.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                No driver assigned
                              </CommandItem>
                              {drivers.map((driver) => (
                                <CommandItem
                                  key={driver.id}
                                  value={driver.name}
                                  onSelect={() => {
                                    field.onChange(driver.id);
                                    setDriverComboOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === driver.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {driver.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground">
                      Only shows drivers from selected subsidiary
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tank Capacities */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Tank Capacities (Liters)</h4>
                <div className="grid grid-cols-1 gap-4">
                  {form.watch('fuel_types')?.includes('diesel') && (
                    <FormField
                      control={form.control}
                      name="tank_capacity_diesel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diesel Tank Capacity</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="90"
                              min={0}
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value ? parseFloat(e.target.value) : undefined;
                                field.onChange(value);
                              }}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {form.watch('fuel_types')?.includes('petrol') && (
                    <FormField
                      control={form.control}
                      name="tank_capacity_petrol"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Petrol Tank Capacity</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="50"
                              min={0}
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value ? parseFloat(e.target.value) : undefined;
                                field.onChange(value);
                              }}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {form.watch('fuel_types')?.includes('cng') && (
                    <FormField
                      control={form.control}
                      name="tank_capacity_cng"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNG Tank Capacity</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="30"
                              min={0}
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value ? parseFloat(e.target.value) : undefined;
                                field.onChange(value);
                              }}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicleStatuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dates Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Important Dates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Purchase Date */}
                <FormField
                  control={form.control}
                  name="purchase_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Purchase Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : "Pick a date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Insurance Expiry */}
                <FormField
                  control={form.control}
                  name="insurance_expiry"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Insurance Expiry</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : "Pick a date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* RC Expiry */}
                <FormField
                  control={form.control}
                  name="rc_expiry"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>RC Expiry</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : "Pick a date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* PUC Expiry */}
                <FormField
                  control={form.control}
                  name="puc_expiry"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>PUC Expiry</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : "Pick a date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : vehicle ? 'Update Vehicle' : 'Add Vehicle'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};