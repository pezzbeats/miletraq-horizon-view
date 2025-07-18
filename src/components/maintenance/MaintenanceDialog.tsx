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
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MaintenanceRecord } from "@/pages/Maintenance";
import { 
  calculateGSTInclusive, 
  calculateGSTExclusive, 
  getGSTBreakdown, 
  validateGSTRate, 
  GST_RATES, 
  formatCurrency,
  type GSTBreakdown 
} from "@/lib/gst-utils";

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
  is_gst_applicable: boolean;
  gst_rate: number;
  gst_amount: number;
  base_cost: number;
  parts_vendor_id?: string; // New field for parts vendor
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
  gst_registered?: boolean;
  gst_number?: string;
  default_gst_rate?: number;
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
  const [partVendors, setPartVendors] = useState<Vendor[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [partsUsed, setPartsUsed] = useState<PartUsed[]>([]);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // GST state for labor
  const [isGSTInvoice, setIsGSTInvoice] = useState(false);
  const [gstType, setGstType] = useState<'inclusive' | 'exclusive'>('inclusive');
  const [laborGSTRate, setLaborGSTRate] = useState(18);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

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
          // Filter vendors that handle labour or parts_labour (for service work)
          const serviceVendors = vendorsRes.data.filter(v => 
            v.vendor_type.includes('labour') || v.vendor_type.includes('parts_labour')
          );
          setVendors(serviceVendors);

          // Filter vendors that handle parts or parts_labour (for parts sourcing)
          const partsVendors = vendorsRes.data.filter(v => 
            v.vendor_type.includes('parts') || v.vendor_type.includes('parts_labour')
          );
          setPartVendors(partsVendors);
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
            is_gst_applicable: (p as any).is_gst_applicable || false,
            gst_rate: (p as any).gst_rate || 0,
            gst_amount: (p as any).gst_amount || 0,
            base_cost: (p as any).base_cost || p.unit_cost,
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
      is_gst_applicable: false,
      gst_rate: 0,
      gst_amount: 0,
      base_cost: 0,
      parts_vendor_id: "",
    }]);
  };

  const updatePartUsed = (index: number, field: keyof PartUsed, value: any) => {
    const updated = [...partsUsed];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calculate GST and total cost
    if (field === 'quantity' || field === 'unit_cost' || field === 'gst_rate' || field === 'is_gst_applicable') {
      const part = updated[index];
      
      if (part.is_gst_applicable && part.gst_rate > 0 && part.unit_cost > 0) {
        // Calculate GST breakdown (assuming inclusive pricing for parts)
        const gstBreakdown = getGSTBreakdown({
          amount: part.unit_cost,
          gstRate: part.gst_rate,
          type: 'inclusive'
        });
        
        part.base_cost = gstBreakdown.baseAmount;
        part.gst_amount = gstBreakdown.gstAmount;
        part.total_cost = gstBreakdown.totalAmount * part.quantity;
      } else {
        // No GST calculation
        part.base_cost = part.unit_cost;
        part.gst_amount = 0;
        part.total_cost = part.quantity * part.unit_cost;
      }
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

      // Calculate labor GST breakdown
      let laborBaseAmount = values.labor_cost;
      let laborGSTAmount = 0;
      
      if (isGSTInvoice && laborGSTRate > 0) {
        const gstBreakdown = getGSTBreakdown({
          amount: values.labor_cost,
          gstRate: laborGSTRate,
          type: gstType
        });
        laborBaseAmount = gstBreakdown.baseAmount;
        laborGSTAmount = gstBreakdown.gstAmount;
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
        // GST fields
        is_gst_invoice: isGSTInvoice,
        gst_type: isGSTInvoice ? gstType : null,
        gst_rate: isGSTInvoice ? laborGSTRate : null,
        labor_gst_amount: laborGSTAmount,
        labor_base_amount: laborBaseAmount,
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
            is_gst_applicable: part.is_gst_applicable,
            gst_rate: part.gst_rate,
            gst_amount: part.gst_amount,
            base_cost: part.base_cost,
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto glass-card border-2 shadow-glass animate-fade-in-scale">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl pointer-events-none" />
        <DialogHeader className="relative z-10 pb-6 border-b border-border/50">
          <DialogTitle className="text-2xl font-bold gradient-text">
            {maintenanceRecord ? "Edit Maintenance Record" : "Add Maintenance Record"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            Record vehicle maintenance details and parts used with comprehensive GST tracking
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

            {/* Service Vendor */}
            <FormField
              control={form.control}
              name="vendor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Vendor</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      const vendor = vendors.find(v => v.id === value);
                      setSelectedVendor(vendor || null);
                      if (vendor?.gst_registered && vendor.default_gst_rate) {
                        setIsGSTInvoice(true);
                        setLaborGSTRate(vendor.default_gst_rate);
                      }
                    }} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vendor (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no-vendor">No vendor</SelectItem>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name} {vendor.gst_registered && <span className="text-xs text-muted-foreground">(GST)</span>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Labor Cost and GST Section */}
            <Card>
              <CardHeader>
                <CardTitle>Labor Cost & GST</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* GST Invoice Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>GST Invoice</FormLabel>
                    <p className="text-sm text-muted-foreground">Is this a GST invoice?</p>
                  </div>
                  <Switch
                    checked={isGSTInvoice}
                    onCheckedChange={setIsGSTInvoice}
                  />
                </div>

                {/* GST Type Selection */}
                {isGSTInvoice && (
                  <div className="space-y-3">
                    <FormLabel>GST Type</FormLabel>
                    <RadioGroup
                      value={gstType}
                      onValueChange={(value: 'inclusive' | 'exclusive') => setGstType(value)}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="inclusive" id="inclusive" />
                        <label htmlFor="inclusive" className="text-sm font-medium">
                          GST Inclusive
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="exclusive" id="exclusive" />
                        <label htmlFor="exclusive" className="text-sm font-medium">
                          GST Exclusive
                        </label>
                      </div>
                    </RadioGroup>
                    
                    {/* GST Rate Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FormLabel>GST Rate (%)</FormLabel>
                        <Select 
                          value={laborGSTRate.toString()} 
                          onValueChange={(value) => setLaborGSTRate(parseFloat(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {GST_RATES.map((rate) => (
                              <SelectItem key={rate.value} value={rate.value.toString()}>
                                {rate.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Labor Cost Input */}
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="labor_cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {isGSTInvoice 
                            ? `${gstType === 'inclusive' ? 'Total' : 'Base'} Labor Cost (₹) *`
                            : 'Labor Cost (₹) *'
                          }
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder={isGSTInvoice 
                              ? (gstType === 'inclusive' ? 'Enter total amount (incl. GST)' : 'Enter base amount (excl. GST)')
                              : 'Enter labor cost'
                            }
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* GST Breakdown Display */}
                {isGSTInvoice && laborCost > 0 && (
                  <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                    <h4 className="text-sm font-medium text-primary">GST Breakdown</h4>
                    {(() => {
                      const gstBreakdown = getGSTBreakdown({
                        amount: laborCost,
                        gstRate: laborGSTRate,
                        type: gstType
                      });
                      return (
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Base Amount:</span>
                            <span>{formatCurrency(gstBreakdown.baseAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>GST ({laborGSTRate}%):</span>
                            <span>{formatCurrency(gstBreakdown.gstAmount)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-medium">
                            <span>Total Amount:</span>
                            <span>{formatCurrency(gstBreakdown.totalAmount)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>

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
                       <div key={index} className="p-4 border rounded-lg space-y-3">
                         <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
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

                           <Select
                             value={part.parts_vendor_id || ""}
                             onValueChange={(value) => updatePartUsed(index, 'parts_vendor_id', value)}
                           >
                             <SelectTrigger>
                               <SelectValue placeholder="Parts vendor" />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="">No vendor</SelectItem>
                               {partVendors.map((vendor) => (
                                 <SelectItem key={vendor.id} value={vendor.id}>
                                   {vendor.name}
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
                             placeholder={part.is_gst_applicable ? (part.gst_rate > 0 ? "Amount" : "Unit Cost") : "Unit Cost"}
                             value={part.unit_cost}
                             onChange={(e) => updatePartUsed(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                           />
                           
                           <Button
                             type="button"
                             variant="outline"
                             size="sm"
                             onClick={() => removePartUsed(index)}
                           >
                             <X className="h-4 w-4" />
                           </Button>
                         </div>

                        {/* GST Section for Part */}
                        <div className="space-y-3 pl-4 border-l-2 border-muted">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <FormLabel className="text-xs">GST Applicable</FormLabel>
                            </div>
                            <Switch
                              checked={part.is_gst_applicable}
                              onCheckedChange={(checked) => updatePartUsed(index, 'is_gst_applicable', checked)}
                            />
                          </div>

                          {part.is_gst_applicable && (
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <FormLabel className="text-xs">GST Rate (%)</FormLabel>
                                <Select 
                                  value={part.gst_rate.toString()} 
                                  onValueChange={(value) => updatePartUsed(index, 'gst_rate', parseFloat(value))}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {GST_RATES.map((rate) => (
                                      <SelectItem key={rate.value} value={rate.value.toString()}>
                                        {rate.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Cost Summary for Part */}
                        <div className="bg-muted/30 p-2 rounded text-xs space-y-1">
                          {part.is_gst_applicable && part.gst_rate > 0 && part.unit_cost > 0 ? (
                            (() => {
                              const gstBreakdown = getGSTBreakdown({
                                amount: part.unit_cost,
                                gstRate: part.gst_rate,
                                type: 'inclusive' // Assuming inclusive for parts
                              });
                              const totalForQuantity = gstBreakdown.totalAmount * part.quantity;
                              return (
                                <div>
                                  <div className="flex justify-between">
                                    <span>Base (per unit):</span>
                                    <span>{formatCurrency(gstBreakdown.baseAmount)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>GST ({part.gst_rate}%):</span>
                                    <span>{formatCurrency(gstBreakdown.gstAmount)}</span>
                                  </div>
                                  <div className="flex justify-between font-medium">
                                    <span>Total ({part.quantity} units):</span>
                                    <span>{formatCurrency(totalForQuantity)}</span>
                                  </div>
                                </div>
                              );
                            })()
                          ) : (
                            <div className="flex justify-between font-medium">
                              <span>Total Cost:</span>
                              <span>₹{part.total_cost.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
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