import { useState, useEffect } from 'react';
import { Plus, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubsidiary } from '@/contexts/SubsidiaryContext';
import { toast } from '@/hooks/use-toast';
import { BudgetTable } from '@/components/budget/BudgetTable';
import { BudgetDialog } from '@/components/budget/BudgetDialog';
import { BudgetOverview } from '@/components/budget/BudgetOverview';
import { useIsMobile } from '@/hooks/use-mobile';

export interface BudgetRecord {
  id: string;
  category: string;
  time_period: string;
  period_start: string;
  period_end: string;
  budgeted_amount: number;
  actual_amount: number;
  remaining_amount: number;
  variance_percentage: number;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export default function Budget() {
  const { profile } = useAuth();
  const { currentSubsidiary, allSubsidiariesView } = useSubsidiary();
  const isMobile = useIsMobile();
  const [budgets, setBudgets] = useState<BudgetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetRecord | null>(null);

  useEffect(() => {
    fetchBudgets();
  }, [currentSubsidiary, allSubsidiariesView]);

  const fetchBudgets = async () => {
    try {
      let query = supabase
        .from('budget')
        .select('*');

      // Apply subsidiary filtering
      if (!allSubsidiariesView && currentSubsidiary) {
        query = query.eq('subsidiary_id', currentSubsidiary.id);
      }

      const { data, error } = await query.order('period_start', { ascending: false });

      if (error) throw error;
      setBudgets(data || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch budgets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudget = () => {
    setEditingBudget(null);
    setDialogOpen(true);
  };

  const handleEditBudget = (budget: BudgetRecord) => {
    setEditingBudget(budget);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    fetchBudgets();
    setDialogOpen(false);
    setEditingBudget(null);
  };

  const handleCopyPrevious = async () => {
    try {
      // Get the most recent budget
      const recentBudget = budgets[0];
      if (!recentBudget) {
        toast({
          title: "No Previous Budget",
          description: "Create your first budget to use this feature",
          variant: "destructive",
        });
        return;
      }

      // Set the copied budget data for editing
      setEditingBudget({
        ...recentBudget,
        id: '', // Clear ID for new budget
        period_start: new Date().toISOString().split('T')[0],
        period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actual_amount: 0,
        remaining_amount: recentBudget.budgeted_amount,
        variance_percentage: 0,
      });
      setDialogOpen(true);
    } catch (error) {
      console.error('Error copying previous budget:', error);
      toast({
        title: "Error",
        description: "Failed to copy previous budget",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl p-8 mb-8">
        <div className="absolute inset-0 gradient-success opacity-90"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="relative z-10 flex items-center justify-between text-white">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-4xl font-bold">Budget Management</h1>
              {allSubsidiariesView && (
                <Badge variant="secondary" className="text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  All Subsidiaries
                </Badge>
              )}
            </div>
            <p className="text-white/90 text-lg">
              {allSubsidiariesView 
                ? "Comprehensive financial planning across all subsidiaries"
                : currentSubsidiary 
                  ? `Financial planning for ${currentSubsidiary.subsidiary_name}`
                  : "Comprehensive financial planning and variance tracking"
              }
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleCopyPrevious}
              variant="outline"
              className="text-white border-white/30 hover:bg-white/20"
            >
              Copy Previous
            </Button>
            <Button
              onClick={handleAddBudget}
              className="btn-gradient text-white border-white/30 hover:bg-white/20"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Budget
            </Button>
          </div>
        </div>
      </div>

      {/* Budget Overview Dashboard */}
      <BudgetOverview budgets={budgets} loading={loading} />

      {/* Budget Table */}
      <Card className="glass-card hover-lift">
        <CardHeader>
          <CardTitle className="gradient-header-text">Budget Records</CardTitle>
          <CardDescription>
            Track and manage your financial planning with variance analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BudgetTable
            budgets={budgets}
            loading={loading}
            onEdit={handleEditBudget}
            onRefresh={fetchBudgets}
          />
        </CardContent>
      </Card>

      {/* Budget Dialog */}
      <BudgetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        budget={editingBudget}
        onSuccess={handleSuccess}
      />

      {/* Mobile FAB */}
      {isMobile && (
        <Button
          onClick={handleAddBudget}
          className="fixed bottom-32 right-4 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}