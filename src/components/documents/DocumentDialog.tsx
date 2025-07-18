import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Upload, Image, FileText } from "lucide-react";
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
import { DocumentRecord } from "@/pages/Documents";

const documentFormSchema = z.object({
  vehicle_id: z.string().min(1, "Vehicle is required"),
  document_type: z.enum(["registration", "insurance", "fitness", "permit", "pollution", "puc"], {
    required_error: "Document type is required",
  }),
  document_name: z.string().min(1, "Document name is required"),
  document_number: z.string().optional(),
  issue_date: z.date({
    required_error: "Issue date is required",
  }),
  expiry_date: z.date({
    required_error: "Expiry date is required",
  }),
  issuing_authority: z.string().min(1, "Issuing authority is required"),
  alert_days_before: z.number().min(1).max(365),
  remarks: z.string().optional(),
}).refine((data) => data.expiry_date > data.issue_date, {
  message: "Expiry date must be after issue date",
  path: ["expiry_date"],
});

interface Vehicle {
  id: string;
  vehicle_number: string;
  make: string;
  model: string;
}

interface DocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document?: DocumentRecord | null;
  onSuccess: () => void;
}

export const DocumentDialog = ({
  open,
  onOpenChange,
  document,
  onSuccess,
}: DocumentDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<z.infer<typeof documentFormSchema>>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      document_type: "registration",
      alert_days_before: 30,
    },
  });

  // Fetch vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('id, vehicle_number, make, model')
          .eq('status', 'active')
          .order('vehicle_number');

        if (error) throw error;
        setVehicles(data || []);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
    };

    if (open) {
      fetchVehicles();
    }
  }, [open]);

  // Reset form when dialog opens/closes or document changes
  useEffect(() => {
    if (open) {
      if (document) {
        // Editing existing document
        form.reset({
          vehicle_id: document.vehicle_id,
          document_type: document.document_type as any,
          document_name: document.document_name,
          document_number: document.document_number || "",
          issue_date: document.issue_date ? new Date(document.issue_date) : new Date(),
          expiry_date: document.expiry_date ? new Date(document.expiry_date) : new Date(),
          issuing_authority: document.issuing_authority || "",
          alert_days_before: document.alert_days_before,
          remarks: document.remarks || "",
        });
        setUploadedFile(document.document_url || null);
      } else {
        // Adding new document
        form.reset({
          document_type: "registration",
          alert_days_before: 30,
        });
        setUploadedFile(null);
      }
    }
  }, [open, document, form]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('maintenance-photos') // Using existing bucket for now
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('maintenance-photos')
        .getPublicUrl(filePath);

      setUploadedFile(publicUrl);
      
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof documentFormSchema>) => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add documents",
          variant: "destructive",
        });
        return;
      }

      // Calculate document status
      const today = new Date();
      const expiryDate = new Date(values.expiry_date);
      const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let status = 'valid';
      if (daysToExpiry < 0) {
        status = 'expired';
      } else if (daysToExpiry <= 30) {
        status = 'expiring_soon';
      } else if (daysToExpiry <= 90) {
        status = 'expiring';
      }

      const documentData = {
        vehicle_id: values.vehicle_id,
        document_type: values.document_type,
        document_name: values.document_name,
        document_number: values.document_number || null,
        issue_date: format(values.issue_date, 'yyyy-MM-dd'),
        expiry_date: format(values.expiry_date, 'yyyy-MM-dd'),
        issuing_authority: values.issuing_authority,
        document_url: uploadedFile,
        alert_days_before: values.alert_days_before,
        remarks: values.remarks || null,
        status: status,
        created_by: user.id,
      };

      if (document) {
        // Update existing document
        const { error } = await supabase
          .from('vehicle_documents')
          .update(documentData as any)
          .eq('id', document.id);
        
        if (error) throw error;
      } else {
        // Create new document
        const { error } = await supabase
          .from('vehicle_documents')
          .insert([documentData as any]);
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: document 
          ? "Document updated successfully" 
          : "Document added successfully",
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: "Error",
        description: "Failed to save document",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const documentTypes = [
    { value: "registration", label: "Registration Certificate (RC)" },
    { value: "insurance", label: "Insurance Certificate" },
    { value: "fitness", label: "Fitness Certificate" },
    { value: "permit", label: "Commercial Permit" },
    { value: "pollution", label: "Pollution Under Control (PUC)" },
    { value: "puc", label: "PUC Certificate" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto modal-content">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 rounded-2xl pointer-events-none" />
        <DialogHeader className="relative z-10 pb-6 border-b border-border/50">
          <DialogTitle className="text-2xl font-bold gradient-header-text">
            {document ? "Edit Document" : "Add Vehicle Document"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            {document ? "Update vehicle compliance document details" : "Add a new vehicle compliance document with expiry tracking"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative z-10">
            {/* Vehicle and Document Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="document_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {documentTypes.map((type) => (
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
            </div>

            {/* Document Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="document_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter document name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="document_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter document number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="issue_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Issue Date *</FormLabel>
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
                              <span>Pick issue date</span>
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
                name="expiry_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expiry Date *</FormLabel>
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
                              <span>Pick expiry date</span>
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
                          disabled={(date) => date < new Date()}
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

            {/* Authority and Alert */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="issuing_authority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issuing Authority *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter issuing authority" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="alert_days_before"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alert Days Before</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="365"
                        placeholder="30"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* File Upload */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Document Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="document-upload"
                    />
                    <label htmlFor="document-upload">
                      <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer"
                        disabled={uploading}
                        asChild
                      >
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          {uploading ? "Uploading..." : "Upload Document"}
                        </span>
                      </Button>
                    </label>
                    {uploadedFile && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">Document uploaded</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload PDF or image files (max 10MB)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Remarks */}
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about this document..."
                      {...field}
                    />
                  </FormControl>
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
              <Button type="submit" disabled={loading} className="btn-gradient">
                {loading ? "Saving..." : document ? "Update Document" : "Add Document"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};