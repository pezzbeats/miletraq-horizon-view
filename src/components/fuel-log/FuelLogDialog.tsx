import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useSubsidiary } from "@/contexts/SubsidiaryContext";

const formSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  vehicle_id: z.string().min(1, "Vehicle is required"),
  fuel_source: z.enum(["internal_tank", "external_pump"], {
    required_error: "Fuel source is required",
  }),
  vendor_id: z.string().optional(),
  fuel_volume: z.number().min(0.1, "Fuel volume must be at least 0.1 liters"),
  rate_per_liter: z.number().min(0).optional(),
  total_cost: z.number().min(0).optional(),
  odometer_reading: z.number().min(0).optional(),
  driver_id: z.string().optional(),
}).refine((data) => {
  // Require vendor if external pump is selected
  if (data.fuel_source === "external_pump" && !data.vendor_id) {
    return false;
  }
  return true;
}, {
  message: "Vendor is required for external pump",
  path: ["vendor_id"],
});

interface FuelLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fuelEntry?: any;
  onSuccess: () => void;
}

interface Vehicle {
  id: string;
  vehicle_number: string;
  make: string;
  model: string;
  fuel_type: string;
  default_driver_id?: string;
}

interface Driver {
  id: string;
  name: string;
}

interface Vendor {
  id: string;
  name: string;
  vendor_type: string[];
}

interface FuelTank {
  current_level: number;
  capacity: number;
}

export const FuelLogDialog = ({ open, onOpenChange, fuelEntry, onSuccess }: FuelLogDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [fuelTank, setFuelTank] = useState<FuelTank | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const { currentSubsidiary } = useSubsidiary();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      fuel_source: "internal_tank",
      fuel_volume: 0,
      rate_per_liter: 0,
      total_cost: 0,
      odometer_reading: 0,
    },
  });

  const watchedValues = form.watch();

  // Fetch reference data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesRes, driversRes, vendorsRes, tankRes] = await Promise.all([
          supabase.from('vehicles').select('*').eq('status', 'active').order('vehicle_number'),
          supabase.from('drivers').select('*').eq('is_active', true).order('name'),
          supabase.from('vendors').select('*').eq('is_active', true).overlaps('vendor_type', ['fuel']),
          supabase.from('fuel_tank').select('*').limit(1).single(),
        ]);

        if (vehiclesRes.data) setVehicles(vehiclesRes.data);
        if (driversRes.data) setDrivers(driversRes.data);
        if (vendorsRes.data) setVendors(vendorsRes.data);
        if (tankRes.data) setFuelTank(tankRes.data);
      } catch (error) {
        console.error('Error fetching reference data:', error);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  // Reset form when dialog opens/closes or entry changes
  useEffect(() => {
    if (open) {
      if (fuelEntry) {
        // Editing existing entry
        form.reset({
          date: new Date(fuelEntry.date),
          vehicle_id: fuelEntry.vehicle_id,
          fuel_source: fuelEntry.fuel_source,
          vendor_id: fuelEntry.vendor_id || "",
          fuel_volume: fuelEntry.fuel_volume,
          rate_per_liter: fuelEntry.rate_per_liter || 0,
          total_cost: fuelEntry.total_cost || 0,
          odometer_reading: fuelEntry.odometer_reading || 0,
          driver_id: fuelEntry.driver_id || "",
        });
      } else {
        // Adding new entry
        form.reset({
          date: new Date(),
          fuel_source: "internal_tank",
          fuel_volume: 0,
          rate_per_liter: 0,
          total_cost: 0,
          odometer_reading: 0,
        });
      }
    }
  }, [open, fuelEntry, form]);

  // Update selected vehicle when vehicle_id changes
  useEffect(() => {
    const vehicleId = watchedValues.vehicle_id;
    if (vehicleId) {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      setSelectedVehicle(vehicle || null);
      
      // Set default driver if vehicle has one
      if (vehicle?.default_driver_id && !fuelEntry) {
        form.setValue('driver_id', vehicle.default_driver_id);
      }
    }
  }, [watchedValues.vehicle_id, vehicles, form, fuelEntry]);

  // Auto-calculate total cost
  useEffect(() => {
    const volume = watchedValues.fuel_volume || 0;
    const rate = watchedValues.rate_per_liter || 0;
    if (volume > 0 && rate > 0) {
      form.setValue('total_cost', volume * rate);
    }
  }, [watchedValues.fuel_volume, watchedValues.rate_per_liter, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      // Validate tank level for internal tank
      if (values.fuel_source === "internal_tank" && fuelTank) {
        if (values.fuel_volume > fuelTank.current_level) {
          toast({
            title: "Warning",
            description: `Fuel volume (${values.fuel_volume}L) exceeds current tank level (${fuelTank.current_level}L)`,
            variant: "destructive",
          });
          return;
        }
      }

      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add fuel entries",
          variant: "destructive",
        });
        return;
      }

      const fuelLogData = {
        date: format(values.date, 'yyyy-MM-dd'),
        vehicle_id: values.vehicle_id,
        fuel_source: values.fuel_source,
        fuel_volume: values.fuel_volume,
        rate_per_liter: values.rate_per_liter || null,
        total_cost: values.total_cost || null,
        odometer_reading: values.odometer_reading || null,
        driver_id: values.driver_id === "no-driver" ? null : values.driver_id || null,
        vendor_id: values.vendor_id || null,
        created_by: user.id,
        subsidiary_id: currentSubsidiary?.id || "",
      };

      let error;
      if (fuelEntry) {
        // Update existing entry
        const result = await supabase
          .from('fuel_log')
          .update(fuelLogData)
          .eq('id', fuelEntry.id);
        error = result.error;
      } else {
        // Create new entry
        const result = await supabase
          .from('fuel_log')
          .insert([fuelLogData]);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: fuelEntry ? "Fuel entry updated successfully" : "Fuel entry added successfully",
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving fuel entry:', error);
      toast({
        title: "Error",
        description: "Failed to save fuel entry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fuelVendors = vendors.filter(vendor => 
    vendor.vendor_type.includes('fuel')
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {fuelEntry ? "Edit Fuel Entry" : "Add Fuel Entry"}
          </DialogTitle>
          <DialogDescription>
            Record fuel consumption details for fleet tracking
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehicle_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.vehicle_number} - {vehicle.make} {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {selectedVehicle && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Selected Vehicle:</div>
                <div className="font-medium">{selectedVehicle.vehicle_number}</div>
                <div className="text-sm">
                  {selectedVehicle.make} {selectedVehicle.model} • 
                  <Badge variant="secondary" className="ml-2">
                    {selectedVehicle.fuel_type}
                  </Badge>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="fuel_source"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Fuel Source *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="internal_tank" id="internal_tank" />
                        <label htmlFor="internal_tank" className="text-sm font-medium">
                          Internal Tank
                          {fuelTank && (
                            <span className="ml-2 text-muted-foreground">
                              (Current: {fuelTank.current_level}L)
                            </span>
                          )}
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="external_pump" id="external_pump" />
                        <label htmlFor="external_pump" className="text-sm font-medium">
                          External Pump
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedValues.fuel_source === "external_pump" && (
              <FormField
                control={form.control}
                name="vendor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vendor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fuelVendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fuel_volume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuel Volume (L) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        placeholder="Enter volume"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rate_per_liter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate per Liter (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter rate"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="total_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Cost (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Auto-calculated"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className={
                          watchedValues.fuel_volume && watchedValues.rate_per_liter
                            ? "bg-muted" 
                            : ""
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="odometer_reading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Odometer Reading (km)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Current odometer"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="driver_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Driver</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select driver (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no-driver">No driver assigned</SelectItem>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : fuelEntry ? "Update Entry" : "Add Entry"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};