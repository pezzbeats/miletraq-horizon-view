import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, X, Upload, Image } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MaintenanceRecord } from "@/pages/Maintenance";

const maintenanceFormSchema = z.object({
  maintenance_date: z.date({
    required_error: "Date is required",
  }),
  vehicle_id: z.string().min(1, "Vehicle is required"),
  maintenance_type: z.enum(["breakdown", "scheduled", "preventive"], {
    required_error: "Maintenance type is required",
  }),
  description: z.string().min(1, "Description is required"),
  odometer_reading: z.number().min(0).optional(),
  labor_cost: z.number().min(0, "Labor cost must be at least 0"),
  vendor_id: z.string().optional(),
});

interface PartUsed {
  id?: string;
  part_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
}

interface Vehicle {
  id: string;
  vehicle_number: string;
  make: string;
  model: string;
}

interface Vendor {
  id: string;
  name: string;
  vendor_type: string[];
}

interface Part {
  id: string;
  name: string;
  part_number?: string;
  category_id?: string;
}

interface MaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maintenanceRecord?: MaintenanceRecord | null;
  onSuccess: () => void;
}

export const MaintenanceDialog = ({
  open,
  onOpenChange,
  maintenanceRecord,
  onSuccess,
}: MaintenanceDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [partsUsed, setPartsUsed] = useState<PartUsed[]>([]);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<z.infer<typeof maintenanceFormSchema>>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      maintenance_date: new Date(),
      maintenance_type: "breakdown",
      labor_cost: 0,
      odometer_reading: 0,
    },
  });

  // Fetch reference data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesRes, vendorsRes, partsRes] = await Promise.all([
          supabase.from('vehicles').select('*').eq('status', 'active').order('vehicle_number'),
          supabase.from('vendors').select('*').eq('is_active', true).order('name'),
          supabase.from('parts_master').select('*').eq('is_active', true).order('name'),
        ]);

        if (vehiclesRes.data) setVehicles(vehiclesRes.data);
        if (vendorsRes.data) {
          // Filter vendors that handle parts or both
          const filteredVendors = vendorsRes.data.filter(v => 
            v.vendor_type.includes('parts') || v.vendor_type.includes('both')
          );
          setVendors(filteredVendors);
        }
        if (partsRes.data) setParts(partsRes.data);
      } catch (error) {
        console.error('Error fetching reference data:', error);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  // Reset form when dialog opens/closes or record changes
  useEffect(() => {
    if (open) {
      if (maintenanceRecord) {
        // Editing existing record
        form.reset({
          maintenance_date: new Date(maintenanceRecord.maintenance_date),
          vehicle_id: maintenanceRecord.vehicle_id,
          maintenance_type: maintenanceRecord.maintenance_type,
          description: maintenanceRecord.description,
          odometer_reading: maintenanceRecord.odometer_reading || 0,
          labor_cost: maintenanceRecord.labor_cost,
          vendor_id: maintenanceRecord.vendor_id || "",
        });
        
        // Load existing parts
        if (maintenanceRecord.maintenance_parts_used) {
          setPartsUsed(maintenanceRecord.maintenance_parts_used.map(p => ({
            id: p.id,
            part_id: p.part_id,
            quantity: p.quantity,
            unit_cost: p.unit_cost,
            total_cost: p.total_cost,
          })));
        }
        
        setUploadedPhoto(maintenanceRecord.photo_url || null);
      } else {
        // Adding new record
        form.reset({
          maintenance_date: new Date(),
          maintenance_type: "breakdown",
          labor_cost: 0,
          odometer_reading: 0,
        });
        setPartsUsed([]);
        setUploadedPhoto(null);
      }
    }
  }, [open, maintenanceRecord, form]);

  const addPartUsed = () => {
    setPartsUsed([...partsUsed, {
      part_id: "",
      quantity: 1,
      unit_cost: 0,
      total_cost: 0,
    }]);
  };

  const updatePartUsed = (index: number, field: keyof PartUsed, value: any) => {
    const updated = [...partsUsed];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calculate total cost
    if (field === 'quantity' || field === 'unit_cost') {
      updated[index].total_cost = updated[index].quantity * updated[index].unit_cost;
    }
    
    setPartsUsed(updated);
  };

  const removePartUsed = (index: number) => {
    setPartsUsed(partsUsed.filter((_, i) => i !== index));
  };

  const totalPartsCost = partsUsed.reduce((sum, part) => sum + part.total_cost, 0);
  const laborCost = form.watch('labor_cost') || 0;
  const totalCost = laborCost + totalPartsCost;

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `maintenance-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('maintenance-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('maintenance-photos')
        .getPublicUrl(filePath);

      setUploadedPhoto(publicUrl);
      
      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof maintenanceFormSchema>) => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add maintenance records",
          variant: "destructive",
        });
        return;
      }

      const maintenanceData = {
        maintenance_date: format(values.maintenance_date, 'yyyy-MM-dd'),
        vehicle_id: values.vehicle_id,
        maintenance_type: values.maintenance_type,
        description: values.description,
        odometer_reading: values.odometer_reading || null,
        labor_cost: values.labor_cost,
        total_cost: totalCost,
        vendor_id: values.vendor_id === "no-vendor" ? null : values.vendor_id || null,
        photo_url: uploadedPhoto,
        created_by: user.id,
      };

      let maintenanceId: string;

      if (maintenanceRecord) {
        // Update existing record
        const { error } = await supabase
          .from('maintenance_log')
          .update(maintenanceData as any)
          .eq('id', maintenanceRecord.id);
        
        if (error) throw error;
        maintenanceId = maintenanceRecord.id;

        // Delete existing parts
        await supabase
          .from('maintenance_parts_used')
          .delete()
          .eq('maintenance_id', maintenanceId);
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('maintenance_log')
          .insert([maintenanceData as any])
          .select()
          .single();
        
        if (error) throw error;
        maintenanceId = data.id;
      }

      // Insert parts used
      if (partsUsed.length > 0) {
        const partsData = partsUsed
          .filter(p => p.part_id && p.quantity > 0)
          .map(part => ({
            maintenance_id: maintenanceId,
            part_id: part.part_id,
            quantity: part.quantity,
            unit_cost: part.unit_cost,
            total_cost: part.total_cost,
          }));

        if (partsData.length > 0) {
          const { error: partsError } = await supabase
            .from('maintenance_parts_used')
            .insert(partsData);
          
          if (partsError) throw partsError;
        }
      }

      toast({
        title: "Success",
        description: maintenanceRecord 
          ? "Maintenance record updated successfully" 
          : "Maintenance record added successfully",
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving maintenance record:', error);
      toast({
        title: "Error",
        description: "Failed to save maintenance record",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {maintenanceRecord ? "Edit Maintenance Record" : "Add Maintenance Record"}
          </DialogTitle>
          <DialogDescription>
            Record vehicle maintenance details and parts used
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maintenance_date"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maintenance_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maintenance Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="breakdown">Breakdown</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="preventive">Preventive</SelectItem>
                      </SelectContent>
                    </Select>
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the maintenance work performed..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="labor_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Labor Cost (₹) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter labor cost"
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
                name="vendor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Vendor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vendor (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="no-vendor">No vendor</SelectItem>
                        {vendors.map((vendor) => (
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
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <FormLabel>Photo (optional)</FormLabel>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    disabled={uploading}
                    asChild
                  >
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? "Uploading..." : "Upload Photo"}
                    </span>
                  </Button>
                </label>
                {uploadedPhoto && (
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Photo uploaded</span>
                  </div>
                )}
              </div>
            </div>

            {/* Parts Used Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Parts Used
                  <Button type="button" onClick={addPartUsed} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Part
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {partsUsed.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No parts added. Click "Add Part" to record parts used.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {partsUsed.map((part, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-3 border rounded-lg">
                        <Select
                          value={part.part_id}
                          onValueChange={(value) => updatePartUsed(index, 'part_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select part" />
                          </SelectTrigger>
                          <SelectContent>
                            {parts.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} {p.part_number && `(${p.part_number})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={part.quantity}
                          onChange={(e) => updatePartUsed(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                        
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Unit Cost"
                          value={part.unit_cost}
                          onChange={(e) => updatePartUsed(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                        />
                        
                        <div className="flex items-center px-3 text-sm font-medium">
                          ₹{part.total_cost.toFixed(2)}
                        </div>
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removePartUsed(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-sm">
                        <span>Labor Cost:</span>
                        <span>₹{laborCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Parts Cost:</span>
                        <span>₹{totalPartsCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center font-bold">
                        <span>Total Cost:</span>
                        <span>₹{totalCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : maintenanceRecord ? "Update Record" : "Add Record"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};