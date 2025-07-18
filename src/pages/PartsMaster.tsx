import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PartsTable } from "@/components/parts/PartsTable";
import { PartDialog } from "@/components/parts/PartDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useSubsidiary } from "@/contexts/SubsidiaryContext";

export interface Part {
  id: string;
  name: string;
  part_number?: string;
  category_id?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  maintenance_categories?: {
    name: string;
  };
  usage_count?: number;
}

const PartsMaster = () => {
  const { currentSubsidiary } = useSubsidiary();
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);

  const fetchParts = async () => {
    try {
      setLoading(true);
      
      // Fetch parts with category names and usage count
      const { data, error } = await supabase
        .from('parts_master')
        .select(`
          *,
          maintenance_categories (
            name
          )
        `)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      // Fetch usage count for each part
      const partsWithUsage = await Promise.all(
        (data || []).map(async (part) => {
          const { count } = await supabase
            .from('maintenance_parts_used')
            .select('*', { count: 'exact', head: true })
            .eq('part_id', part.id);
          
          return {
            ...part,
            usage_count: count || 0,
          };
        })
      );

      setParts(partsWithUsage);
    } catch (error) {
      console.error('Error fetching parts:', error);
      toast({
        title: "Error",
        description: "Failed to load parts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentSubsidiary) {
      fetchParts();
    }
  }, [currentSubsidiary]);

  const handleAddPart = () => {
    setEditingPart(null);
    setDialogOpen(true);
  };

  const handleEditPart = (part: Part) => {
    setEditingPart(part);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    fetchParts();
    setDialogOpen(false);
    setEditingPart(null);
  };

  // Calculate summary statistics
  const totalParts = parts.length;
  const categorizedParts = parts.filter(p => p.category_id).length;
  const totalUsage = parts.reduce((sum, part) => sum + (part.usage_count || 0), 0);
  const mostUsedPart = parts.reduce((max, part) => 
    (part.usage_count || 0) > (max.usage_count || 0) ? part : max, 
    parts[0]
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Parts Master</h1>
          <p className="text-muted-foreground">Manage inventory parts catalog</p>
        </div>
        <Button onClick={handleAddPart} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Part
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              Categorized
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categorizedParts}</div>
            <div className="text-xs text-muted-foreground">
              {totalParts > 0 ? Math.round((categorizedParts / totalParts) * 100) : 0}% categorized
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage}</div>
            <div className="text-xs text-muted-foreground">times used</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Most Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold truncate" title={mostUsedPart?.name}>
              {mostUsedPart?.name || "—"}
            </div>
            <div className="text-xs text-muted-foreground">
              {mostUsedPart?.usage_count || 0} times
            </div>
          </CardContent>
        </Card>
      </div>

      <PartsTable 
        parts={parts}
        loading={loading}
        onEdit={handleEditPart}
        onRefresh={fetchParts}
      />

      <PartDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        part={editingPart}
        onSuccess={handleSuccess}
      />

      {/* Mobile FAB */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:hidden"
        onClick={handleAddPart}
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default PartsMaster;