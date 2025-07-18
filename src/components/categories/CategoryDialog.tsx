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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Category } from "@/pages/CategoriesMaster";
import { useSubsidiary } from "@/contexts/SubsidiaryContext";

const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required").max(100, "Category name must be less than 100 characters"),
  description: z.string().optional(),
});

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onSuccess: () => void;
}

export const CategoryDialog = ({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { currentSubsidiary } = useSubsidiary();

  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Reset form when dialog opens/closes or category changes
  useEffect(() => {
    if (open) {
      if (category) {
        // Editing existing category
        form.reset({
          name: category.name,
          description: category.description || "",
        });
      } else {
        // Adding new category
        form.reset({
          name: "",
          description: "",
        });
      }
    }
  }, [open, category, form]);

  const onSubmit = async (values: z.infer<typeof categoryFormSchema>) => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to manage categories",
          variant: "destructive",
        });
        return;
      }

      // Check for duplicate names (case-insensitive)
      const { data: existingCategories, error: checkError } = await supabase
        .from('maintenance_categories')
        .select('id, name')
        .eq('is_active', true)
        .ilike('name', values.name);

      if (checkError) throw checkError;

      // If editing, exclude the current category from duplicate check
      const duplicates = existingCategories?.filter(cat => 
        category ? cat.id !== category.id : true
      );

      if (duplicates && duplicates.length > 0) {
        form.setError('name', {
          type: 'manual',
          message: 'A category with this name already exists'
        });
        return;
      }

      const categoryData = {
        name: values.name.trim(),
        description: values.description?.trim() || null,
        created_by: user.id,
        subsidiary_id: currentSubsidiary?.id || "",
        is_active: true,
      };

      let error;
      if (category) {
        // Update existing category
        const result = await supabase
          .from('maintenance_categories')
          .update(categoryData)
          .eq('id', category.id);
        error = result.error;
      } else {
        // Create new category
        const result = await supabase
          .from('maintenance_categories')
          .insert([categoryData]);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: category ? "Category updated successfully" : "Category added successfully",
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Category" : "Add Category"}
          </DialogTitle>
          <DialogDescription>
            {category ? "Update category information" : "Create a new parts category"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter category name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description for this category"
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
                {loading ? "Saving..." : category ? "Update Category" : "Add Category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};