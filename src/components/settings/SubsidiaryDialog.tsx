import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const subsidiaryFormSchema = z.object({
  subsidiary_name: z.string().min(1, 'Subsidiary name is required').max(100),
  subsidiary_code: z.string().min(1, 'Subsidiary code is required').max(20),
  business_type: z.enum(['construction', 'hospitality', 'education', 'other']),
  gstin: z.string().optional(),
  registered_address: z.string().optional(),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
});

interface Subsidiary {
  id: string;
  subsidiary_name: string;
  subsidiary_code: string;
  business_type: string;
  gstin?: string;
  registered_address?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
}

interface SubsidiaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subsidiary?: Subsidiary | null;
  onSuccess: () => void;
}

export const SubsidiaryDialog = ({
  open,
  onOpenChange,
  subsidiary,
  onSuccess,
}: SubsidiaryDialogProps) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof subsidiaryFormSchema>>({
    resolver: zodResolver(subsidiaryFormSchema),
    defaultValues: {
      subsidiary_name: '',
      subsidiary_code: '',
      business_type: 'other',
      gstin: '',
      registered_address: '',
      contact_person: '',
      phone: '',
      email: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (subsidiary) {
        form.reset({
          subsidiary_name: subsidiary.subsidiary_name,
          subsidiary_code: subsidiary.subsidiary_code,
          business_type: subsidiary.business_type as any,
          gstin: subsidiary.gstin || '',
          registered_address: subsidiary.registered_address || '',
          contact_person: subsidiary.contact_person || '',
          phone: subsidiary.phone || '',
          email: subsidiary.email || '',
        });
      } else {
        form.reset({
          subsidiary_name: '',
          subsidiary_code: '',
          business_type: 'other',
          gstin: '',
          registered_address: '',
          contact_person: '',
          phone: '',
          email: '',
        });
      }
    }
  }, [open, subsidiary, form]);

  const onSubmit = async (values: z.infer<typeof subsidiaryFormSchema>) => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to manage subsidiaries',
          variant: 'destructive',
        });
        return;
      }

      // Check for duplicate subsidiary code (case-insensitive)
      const { data: existingSubsidiaries, error: checkError } = await supabase
        .from('subsidiaries')
        .select('id, subsidiary_code')
        .ilike('subsidiary_code', values.subsidiary_code);

      if (checkError) throw checkError;

      const duplicates = existingSubsidiaries?.filter(sub => 
        subsidiary ? sub.id !== subsidiary.id : true
      );

      if (duplicates && duplicates.length > 0) {
        form.setError('subsidiary_code', {
          type: 'manual',
          message: 'A subsidiary with this code already exists'
        });
        return;
      }

      const subsidiaryData = {
        subsidiary_name: values.subsidiary_name.trim(),
        subsidiary_code: values.subsidiary_code.trim().toUpperCase(),
        business_type: values.business_type,
        gstin: values.gstin?.trim() || null,
        registered_address: values.registered_address?.trim() || null,
        contact_person: values.contact_person?.trim() || null,
        phone: values.phone?.trim() || null,
        email: values.email?.trim() || null,
        is_active: true,
      };

      let error;
      if (subsidiary) {
        const result = await supabase
          .from('subsidiaries')
          .update(subsidiaryData)
          .eq('id', subsidiary.id);
        error = result.error;
      } else {
        const result = await supabase
          .from('subsidiaries')
          .insert([subsidiaryData]);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: 'Success',
        description: subsidiary ? 'Subsidiary updated successfully' : 'Subsidiary added successfully',
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving subsidiary:', error);
      toast({
        title: 'Error',
        description: 'Failed to save subsidiary',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {subsidiary ? 'Edit Subsidiary' : 'Add Subsidiary'}
          </DialogTitle>
          <DialogDescription>
            {subsidiary ? 'Update subsidiary information' : 'Add a new business subsidiary'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subsidiary_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subsidiary Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter subsidiary name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subsidiary_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subsidiary Code *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., HQ, BR1, SUB2"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
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
                name="business_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="construction">Construction</SelectItem>
                        <SelectItem value="hospitality">Hospitality</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gstin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GSTIN</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="GST identification number"
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
              name="registered_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registered Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Complete registered address"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="contact_person"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Primary contact name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contact phone number"
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
                        placeholder="Contact email address"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : subsidiary ? 'Update Subsidiary' : 'Add Subsidiary'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};