import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoriesTable } from "@/components/categories/CategoriesTable";
import { CategoryDialog } from "@/components/categories/CategoryDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Category {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  parts_count?: number;
}

const CategoriesMaster = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Fetch categories with parts count
      const { data, error } = await supabase
        .from('maintenance_categories')
        .select(`
          *,
          parts_master (
            id
          )
        `)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      // Transform data to include parts count
      const categoriesWithCount = (data || []).map(category => ({
        ...category,
        parts_count: category.parts_master?.length || 0,
      }));

      setCategories(categoriesWithCount);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    fetchCategories();
    setDialogOpen(false);
    setEditingCategory(null);
  };

  // Calculate summary statistics
  const totalCategories = categories.length;
  const totalParts = categories.reduce((sum, cat) => sum + (cat.parts_count || 0), 0);
  const avgPartsPerCategory = totalCategories > 0 ? totalParts / totalCategories : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Categories Master</h1>
          <p className="text-muted-foreground">Organize parts inventory with categories</p>
        </div>
        <Button onClick={handleAddCategory} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Parts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Parts/Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPartsPerCategory.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      <CategoriesTable 
        categories={categories}
        loading={loading}
        onEdit={handleEditCategory}
        onRefresh={fetchCategories}
      />

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
        onSuccess={handleSuccess}
      />

      {/* Mobile FAB */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:hidden"
        onClick={handleAddCategory}
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default CategoriesMaster;