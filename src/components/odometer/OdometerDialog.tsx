import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const odometerFormSchema = z.object({
  reading_date: z.date({
    required_error: "Reading date is required",
  }).refine((date) => date <= new Date(), {
    message: "Reading date cannot be in the future",
  }),
  vehicle_id: z.string().min(1, "Vehicle is required"),
  odometer_reading: z.number().min(0, "Odometer reading must be at least 0"),
  current_location: z.string().optional(),
  notes: z.string().optional(),
  created_by: z.string().min(1, "Recorded by is required"),
});

interface OdometerReading {
  id: string;
  reading_date: string;
  vehicle_id: string;
  odometer_reading: number;
  current_location?: string;
  notes?: string;
  created_by: string;
  vehicles: {
    id: string;
    vehicle_number: string;
    make: string;
    model: string;
  };
  profiles: {
    id: string;
    full_name: string;
  };
}

interface Vehicle {
  id: string;
  vehicle_number: string;
  make: string;
  model: string;
  status: string;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
}

interface OdometerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reading?: OdometerReading | null;
  onSuccess: () => void;
}

export const OdometerDialog = ({
  open,
  onOpenChange,
  reading,
  onSuccess,
}: OdometerDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [previousReading, setPreviousReading] = useState<number | null>(null);
  const [validationWarning, setValidationWarning] = useState<string>("");

  const form = useForm<z.infer<typeof odometerFormSchema>>({
    resolver: zodResolver(odometerFormSchema),
    defaultValues: {
      reading_date: new Date(),
      vehicle_id: "",
      odometer_reading: 0,
      current_location: "",
      notes: "",
      created_by: "",
    },
  });

  // Fetch reference data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesRes, profilesRes, userRes] = await Promise.all([
          supabase.from('vehicles').select('*').eq('status', 'active').order('vehicle_number'),
          supabase.from('profiles').select('*').order('full_name'),
          supabase.auth.getUser(),
        ]);

        if (vehiclesRes.data) setVehicles(vehiclesRes.data);
        if (profilesRes.data) setProfiles(profilesRes.data);
        if (userRes.data.user) {
          const userProfile = profilesRes.data?.find(p => p.user_id === userRes.data.user?.id);
          if (userProfile) {
            setCurrentUser(userProfile.id);
            form.setValue('created_by', userProfile.id);
          }
        }
      } catch (error) {
        console.error('Error fetching reference data:', error);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open, form]);

  // Reset form when dialog opens/closes or reading changes
  useEffect(() => {
    if (open) {
      if (reading) {
        // Editing existing reading
        form.reset({
          reading_date: new Date(reading.reading_date),
          vehicle_id: reading.vehicle_id,
          odometer_reading: reading.odometer_reading,
          current_location: reading.current_location || "",
          notes: reading.notes || "",
          created_by: reading.created_by,
        });
      } else {
        // Adding new reading
        form.reset({
          reading_date: new Date(),
          vehicle_id: "",
          odometer_reading: 0,
          current_location: "",
          notes: "",
          created_by: currentUser,
        });
      }
      setPreviousReading(null);
      setValidationWarning("");
    }
  }, [open, reading, currentUser, form]);

  // Fetch previous reading when vehicle is selected
  const handleVehicleChange = async (vehicleId: string) => {
    try {
      const { data, error } = await supabase
        .from('odometer_readings')
        .select('odometer_reading, reading_date')
        .eq('vehicle_id', vehicleId)
        .order('reading_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setPreviousReading(data[0].odometer_reading);
      } else {
        setPreviousReading(null);
      }
    } catch (error) {
      console.error('Error fetching previous reading:', error);
    }
  };

  // Validate odometer reading
  const validateOdometerReading = (newReading: number) => {
    setValidationWarning("");

    if (previousReading !== null) {
      if (newReading < previousReading) {
        setValidationWarning(`New reading (${newReading.toLocaleString()} km) is less than previous reading (${previousReading.toLocaleString()} km)`);
      } else {
        const distance = newReading - previousReading;
        if (distance > 1000) {
          setValidationWarning(`Distance increase of ${distance.toLocaleString()} km seems unusually high. Please verify the reading.`);
        }
      }
    }
  };

  const onSubmit = async (values: z.infer<typeof odometerFormSchema>) => {
    try {
      setLoading(true);

      // Check for duplicate readings on same date for same vehicle
      if (!reading) {
        const { data: existingReading, error: checkError } = await supabase
          .from('odometer_readings')
          .select('id')
          .eq('vehicle_id', values.vehicle_id)
          .eq('reading_date', format(values.reading_date, 'yyyy-MM-dd'));

        if (checkError) throw checkError;

        if (existingReading && existingReading.length > 0) {
          toast({
            title: "Duplicate Reading",
            description: "A reading for this vehicle already exists for this date",
            variant: "destructive",
          });
          return;
        }
      }

      const readingData = {
        reading_date: format(values.reading_date, 'yyyy-MM-dd'),
        vehicle_id: values.vehicle_id,
        odometer_reading: values.odometer_reading,
        current_location: values.current_location || null,
        notes: values.notes || null,
        created_by: values.created_by,
      };

      let error;
      if (reading) {
        // Update existing reading
        const result = await supabase
          .from('odometer_readings')
          .update(readingData)
          .eq('id', reading.id);
        error = result.error;
      } else {
        // Create new reading
        const result = await supabase
          .from('odometer_readings')
          .insert([readingData]);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: reading ? "Odometer reading updated successfully" : "Odometer reading recorded successfully",
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving odometer reading:', error);
      toast({
        title: "Error",
        description: "Failed to save odometer reading",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const watchedVehicleId = form.watch('vehicle_id');
  const watchedOdometerReading = form.watch('odometer_reading');

  useEffect(() => {
    if (watchedVehicleId) {
      handleVehicleChange(watchedVehicleId);
    }
  }, [watchedVehicleId]);

  useEffect(() => {
    if (watchedOdometerReading > 0) {
      validateOdometerReading(watchedOdometerReading);
    }
  }, [watchedOdometerReading, previousReading]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {reading ? "Edit Odometer Reading" : "Add Odometer Reading"}
          </DialogTitle>
          <DialogDescription>
            {reading ? "Update the odometer reading details" : "Record a new odometer reading for mileage tracking"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reading_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Reading Date *</FormLabel>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="odometer_reading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Odometer Reading (km) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Current odometer reading"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    {previousReading !== null && (
                      <div className="text-sm text-muted-foreground">
                        Previous reading: {previousReading.toLocaleString()} km
                        {watchedOdometerReading > previousReading && (
                          <span className="ml-2 text-primary">
                            (+{(watchedOdometerReading - previousReading).toLocaleString()} km)
                          </span>
                        )}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="current_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Where was this reading taken?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="created_by"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recorded By *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select person" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any observations or notes about this reading..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {validationWarning && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {validationWarning}
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : reading ? "Update Reading" : "Save Reading"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};