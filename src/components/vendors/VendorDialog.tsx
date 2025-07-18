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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Vendor } from "@/pages/Vendors";

const vendorFormSchema = z.object({
  name: z.string().min(1, "Vendor name is required").max(100, "Vendor name must be less than 100 characters"),
  vendor_type: z.array(z.string()).min(1, "At least one vendor type is required"),
  contact_person: z.string().min(1, "Contact person is required"),
  phone: z.string().min(10, "Phone number is required").regex(/^[6-9]\d{9}$/, "Invalid Indian phone number format"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  address: z.string().min(1, "Address is required"),
  gst_number: z.string().optional(),
  credit_terms: z.string().optional(),
  is_active: z.boolean().default(true),
  remarks: z.string().optional(),
});

interface VendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor?: Vendor | null;
  onSuccess: () => void;
}

const VENDOR_TYPES = [
  { id: "fuel", label: "Fuel" },
  { id: "parts", label: "Parts" },
  { id: "both", label: "Both" },
];

export const VendorDialog = ({
  open,
  onOpenChange,
  vendor,
  onSuccess,
}: VendorDialogProps) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof vendorFormSchema>>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      name: "",
      vendor_type: [],
      contact_person: "",
      phone: "",
      email: "",
      address: "",
      gst_number: "",
      credit_terms: "",
      is_active: true,
      remarks: "",
    },
  });

  // Reset form when dialog opens/closes or vendor changes
  useEffect(() => {
    if (open) {
      if (vendor) {
        // Editing existing vendor
        form.reset({
          name: vendor.name,
          vendor_type: vendor.vendor_type,
          contact_person: vendor.contact_person || "",
          phone: vendor.phone || "",
          email: vendor.email || "",
          address: vendor.address || "",
          gst_number: "", // GST number not in current schema
          credit_terms: "", // Credit terms not in current schema
          is_active: vendor.is_active,
          remarks: "", // Remarks not in current schema
        });
      } else {
        // Adding new vendor
        form.reset({
          name: "",
          vendor_type: [],
          contact_person: "",
          phone: "",
          email: "",
          address: "",
          gst_number: "",
          credit_terms: "",
          is_active: true,
          remarks: "",
        });
      }
    }
  }, [open, vendor, form]);

  const validateGST = (gst: string) => {
    if (!gst) return true; // Optional field
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  };

  const onSubmit = async (values: z.infer<typeof vendorFormSchema>) => {
    try {
      setLoading(true);

      // Validate GST number if provided
      if (values.gst_number && !validateGST(values.gst_number)) {
        form.setError('gst_number', {
          type: 'manual',
          message: 'Invalid GST number format'
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to manage vendors",
          variant: "destructive",
        });
        return;
      }

      // Check for duplicate names (case-insensitive)
      const { data: existingVendors, error: checkError } = await supabase
        .from('vendors')
        .select('id, name')
        .eq('is_active', true)
        .ilike('name', values.name);

      if (checkError) throw checkError;

      // If editing, exclude the current vendor from duplicate check
      const duplicates = existingVendors?.filter(v => 
        vendor ? v.id !== vendor.id : true
      );

      if (duplicates && duplicates.length > 0) {
        form.setError('name', {
          type: 'manual',
          message: 'A vendor with this name already exists'
        });
        return;
      }

      const vendorData = {
        name: values.name.trim(),
        vendor_type: values.vendor_type,
        contact_person: values.contact_person.trim(),
        phone: values.phone.trim(),
        email: values.email?.trim() || null,
        address: values.address.trim(),
        is_active: values.is_active,
        created_by: user.id,
      };

      let error;
      if (vendor) {
        // Update existing vendor
        const result = await supabase
          .from('vendors')
          .update(vendorData)
          .eq('id', vendor.id);
        error = result.error;
      } else {
        // Create new vendor
        const result = await supabase
          .from('vendors')
          .insert([vendorData]);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: vendor ? "Vendor updated successfully" : "Vendor added successfully",
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving vendor:', error);
      toast({
        title: "Error",
        description: "Failed to save vendor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVendorTypeChange = (typeId: string, checked: boolean) => {
    const currentTypes = form.getValues('vendor_type');
    
    if (typeId === 'both') {
      // If selecting "Both", clear other selections and set only "both"
      if (checked) {
        form.setValue('vendor_type', ['both']);
      } else {
        form.setValue('vendor_type', []);
      }
    } else {
      // If selecting fuel or parts, remove "both" and manage individual selections
      let newTypes = currentTypes.filter(t => t !== 'both');
      
      if (checked) {
        newTypes = [...newTypes, typeId];
      } else {
        newTypes = newTypes.filter(t => t !== typeId);
      }
      
      form.setValue('vendor_type', newTypes);
    }
  };

  const watchedVendorType = form.watch('vendor_type');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {vendor ? "Edit Vendor" : "Add Vendor"}
          </DialogTitle>
          <DialogDescription>
            {vendor ? "Update vendor information" : "Add a new supplier to the system"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter vendor name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_person"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter contact person name"
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
              name="vendor_type"
              render={() => (
                <FormItem>
                  <FormLabel>Vendor Type *</FormLabel>
                  <div className="flex gap-4">
                    {VENDOR_TYPES.map((type) => (
                      <div key={type.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={type.id}
                          checked={watchedVendorType?.includes(type.id)}
                          onCheckedChange={(checked) => 
                            handleVendorTypeChange(type.id, checked as boolean)
                          }
                          disabled={type.id !== 'both' && watchedVendorType?.includes('both')}
                        />
                        <label htmlFor={type.id} className="text-sm font-medium">
                          {type.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter 10-digit mobile number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email address"
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
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter complete address"
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
                name="gst_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter GST number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="credit_terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credit Terms</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 30 days, Cash"
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
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional remarks or notes"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Active vendors will appear in relevant dropdowns
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
                {loading ? "Saving..." : vendor ? "Update Vendor" : "Add Vendor"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};