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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Part } from "@/pages/PartsMaster";

const partFormSchema = z.object({
  name: z.string().min(1, "Part name is required").max(100, "Part name must be less than 100 characters"),
  part_number: z.string().optional(),
  category_id: z.string().min(1, "Category is required"),
  description: z.string().optional(),
});

const UNIT_OPTIONS = [
  { value: "piece", label: "Piece" },
  { value: "liter", label: "Liter" },
  { value: "kilogram", label: "Kilogram" },
  { value: "meter", label: "Meter" },
  { value: "set", label: "Set" },
  { value: "pair", label: "Pair" },
  { value: "bottle", label: "Bottle" },
  { value: "packet", label: "Packet" },
];

interface Category {
  id: string;
  name: string;
}

interface PartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  part?: Part | null;
  onSuccess: () => void;
}

export const PartDialog = ({
  open,
  onOpenChange,
  part,
  onSuccess,
}: PartDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const form = useForm<z.infer<typeof partFormSchema>>({
    resolver: zodResolver(partFormSchema),
    defaultValues: {
      name: "",
      part_number: "",
      category_id: "",
      description: "",
    },
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('maintenance_categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }
      
      setCategories(data || []);
    };

    if (open) {
      fetchCategories();
    }
  }, [open]);

  // Reset form when dialog opens/closes or part changes
  useEffect(() => {
    if (open) {
      if (part) {
        // Editing existing part
        form.reset({
          name: part.name,
          part_number: part.part_number || "",
          category_id: part.category_id || "",
          description: part.description || "",
        });
      } else {
        // Adding new part
        form.reset({
          name: "",
          part_number: "",
          category_id: "",
          description: "",
        });
      }
    }
  }, [open, part, form]);

  const onSubmit = async (values: z.infer<typeof partFormSchema>) => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to manage parts",
          variant: "destructive",
        });
        return;
      }

      // Check for duplicate names (case-insensitive)
      const { data: existingParts, error: checkError } = await supabase
        .from('parts_master')
        .select('id, name')
        .eq('is_active', true)
        .ilike('name', values.name);

      if (checkError) throw checkError;

      // If editing, exclude the current part from duplicate check
      const duplicates = existingParts?.filter(p => 
        part ? p.id !== part.id : true
      );

      if (duplicates && duplicates.length > 0) {
        form.setError('name', {
          type: 'manual',
          message: 'A part with this name already exists'
        });
        return;
      }

      const partData = {
        name: values.name.trim(),
        part_number: values.part_number?.trim() || null,
        category_id: values.category_id || null,
        description: values.description?.trim() || null,
        created_by: user.id,
        is_active: true,
      };

      let error;
      if (part) {
        // Update existing part
        const result = await supabase
          .from('parts_master')
          .update(partData)
          .eq('id', part.id);
        error = result.error;
      } else {
        // Create new part
        const result = await supabase
          .from('parts_master')
          .insert([partData]);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: part ? "Part updated successfully" : "Part added successfully",
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving part:', error);
      toast({
        title: "Error",
        description: "Failed to save part",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {part ? "Edit Part" : "Add Part"}
          </DialogTitle>
          <DialogDescription>
            {part ? "Update part information" : "Add a new part to inventory"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Part Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter part name"
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
                name="part_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Optional part number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description or specifications"
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
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : part ? "Update Part" : "Add Part"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};