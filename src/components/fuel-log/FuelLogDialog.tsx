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
  fuel_type: z.enum(["diesel", "petrol", "cng"], {
    required_error: "Fuel type is required",
  }),
  fuel_source: z.enum(["internal_tank", "external_vendor"], {
    required_error: "Fuel source is required",
  }),
  vendor_id: z.string().optional(),
  fuel_volume: z.number().min(0.1, "Fuel volume must be at least 0.1 liters"),
  rate_per_liter: z.number().min(0).optional(),
  total_cost: z.number().min(0).optional(),
  odometer_reading: z.number().min(0).optional(),
  driver_id: z.string().optional(),
}).refine((data) => {
  // Require vendor if external vendor is selected
  if (data.fuel_source === "external_vendor" && !data.vendor_id) {
    return false;
  }
  return true;
}, {
  message: "Vendor is required for external vendor",
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
  fuel_types: any;
  default_fuel_type: string;
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
  id: string;
  fuel_type: string;
  current_volume: number;
  capacity: number;
}

export const FuelLogDialog = ({ open, onOpenChange, fuelEntry, onSuccess }: FuelLogDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [fuelTanks, setFuelTanks] = useState<FuelTank[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const { currentSubsidiary } = useSubsidiary();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      fuel_type: "diesel",
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
        const [vehiclesRes, driversRes, vendorsRes, tanksRes] = await Promise.all([
          supabase.from('vehicles').select('*').eq('status', 'active').order('vehicle_number'),
          supabase.from('drivers').select('*').eq('is_active', true).order('name'),
          supabase.from('vendors').select('*').eq('is_active', true).overlaps('vendor_type', ['fuel']),
          supabase.from('fuel_tanks').select('*').eq('is_active', true).order('fuel_type'),
        ]);

        if (vehiclesRes.data) setVehicles(vehiclesRes.data);
        if (driversRes.data) setDrivers(driversRes.data);
        if (vendorsRes.data) setVendors(vendorsRes.data);
        if (tanksRes.data) setFuelTanks(tanksRes.data);
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
          fuel_type: fuelEntry.fuel_type || "diesel",
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
          fuel_type: "diesel",
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
      
      // Set default driver and fuel type if vehicle has them
      if (vehicle && !fuelEntry) {
        if (vehicle.default_driver_id) {
          form.setValue('driver_id', vehicle.default_driver_id);
        }
        if (vehicle.default_fuel_type) {
          form.setValue('fuel_type', vehicle.default_fuel_type as any);
        }
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
      if (values.fuel_source === "internal_tank") {
        const relevantTank = fuelTanks.find(tank => tank.fuel_type === values.fuel_type);
        if (relevantTank && values.fuel_volume > relevantTank.current_volume) {
          toast({
            title: "Warning",
            description: `Fuel volume (${values.fuel_volume}L) exceeds current ${values.fuel_type} tank level (${relevantTank.current_volume}L)`,
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

      // Find the relevant tank for internal tank fueling
      const relevantTank = fuelTanks.find(tank => tank.fuel_type === values.fuel_type);
      
      const fuelLogData = {
        date: format(values.date, 'yyyy-MM-dd'),
        vehicle_id: values.vehicle_id,
        fuel_type: values.fuel_type,
        fuel_source: values.fuel_source,
        fuel_source_type: values.fuel_source,
        fuel_volume: values.fuel_volume,
        rate_per_liter: values.rate_per_liter || null,
        total_cost: values.total_cost || null,
        odometer_reading: values.odometer_reading || null,
        driver_id: values.driver_id === "no-driver" ? null : values.driver_id || null,
        vendor_id: values.vendor_id || null,
        internal_tank_id: values.fuel_source === "internal_tank" ? relevantTank?.id || null : null,
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
                <div className="text-sm flex items-center gap-2">
                  {selectedVehicle.make} {selectedVehicle.model} • 
                   <div className="flex gap-1">
                     {selectedVehicle.fuel_types && Array.isArray(selectedVehicle.fuel_types) ? (
                       selectedVehicle.fuel_types.map((fuelType: string) => (
                         <Badge key={fuelType} variant="secondary">
                           {fuelType}
                         </Badge>
                       ))
                     ) : (
                       <Badge variant="secondary">
                         {selectedVehicle.default_fuel_type || 'diesel'}
                       </Badge>
                     )}
                   </div>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="fuel_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuel Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                    </FormControl>
                     <SelectContent>
                       {selectedVehicle?.fuel_types && Array.isArray(selectedVehicle.fuel_types) ? (
                         selectedVehicle.fuel_types.map((fuelType: string) => (
                           <SelectItem key={fuelType} value={fuelType}>
                             {fuelType.charAt(0).toUpperCase() + fuelType.slice(1)}
                           </SelectItem>
                         ))
                       ) : (
                         <>
                           <SelectItem value="diesel">Diesel</SelectItem>
                           <SelectItem value="petrol">Petrol</SelectItem>
                           <SelectItem value="cng">CNG</SelectItem>
                         </>
                       )}
                     </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                          {(() => {
                            const relevantTank = fuelTanks.find(tank => tank.fuel_type === watchedValues.fuel_type);
                            return relevantTank && (
                              <span className="ml-2 text-muted-foreground">
                                (Current: {relevantTank.current_volume}L)
                              </span>
                            );
                          })()}
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="external_vendor" id="external_vendor" />
                        <label htmlFor="external_vendor" className="text-sm font-medium">
                          External Vendor
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedValues.fuel_source === "external_vendor" && (
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