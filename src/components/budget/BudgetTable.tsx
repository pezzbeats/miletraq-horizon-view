import { useState } from 'react';
import { format } from 'date-fns';
import { 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  RotateCcw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { BudgetRecord } from '@/pages/Budget';

interface BudgetTableProps {
  budgets: BudgetRecord[];
  loading: boolean;
  onEdit: (budget: BudgetRecord) => void;
  onRefresh: () => void;
}

export const BudgetTable = ({
  budgets,
  loading,
  onEdit,
  onRefresh,
}: BudgetTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredBudgets = budgets.filter((budget) => {
    const matchesSearch = 
      budget.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (budget.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || budget.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || budget.status === statusFilter;
    const matchesPeriod = periodFilter === 'all' || budget.time_period === periodFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesPeriod;
  });

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      const { error } = await supabase
        .from('budget')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Budget deleted successfully",
      });

      onRefresh();
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast({
        title: "Error",
        description: "Failed to delete budget",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getVarianceBadge = (variance: number) => {
    if (variance > 10) {
      return (
        <Badge className="status-inactive">
          <TrendingUp className="h-3 w-3 mr-1" />
          Over Budget ({variance.toFixed(1)}%)
        </Badge>
      );
    } else if (variance > 0) {
      return (
        <Badge className="gradient-warning text-white">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Above ({variance.toFixed(1)}%)
        </Badge>
      );
    } else if (variance > -20) {
      return (
        <Badge className="status-warning">
          <TrendingDown className="h-3 w-3 mr-1" />
          Under ({Math.abs(variance).toFixed(1)}%)
        </Badge>
      );
    } else {
      return (
        <Badge className="status-active">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Well Under ({Math.abs(variance).toFixed(1)}%)
        </Badge>
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="status-active">Active</Badge>;
      case 'completed':
        return <Badge className="status-warning">Completed</Badge>;
      case 'cancelled':
        return <Badge className="status-inactive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryDisplay = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'fuel': 'Fuel',
      'maintenance': 'Maintenance',
      'parts': 'Parts'
    };
    return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getPeriodDisplay = (period: string) => {
    const periodMap: { [key: string]: string } = {
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'yearly': 'Yearly'
    };
    return periodMap[period] || period;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Budgets Found</h3>
        <p className="text-muted-foreground mb-4">
          Create your first budget to start financial planning and tracking
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Enhanced Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 glass-card rounded-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search budgets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="fuel">Fuel</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="parts">Parts</SelectItem>
          </SelectContent>
        </Select>

        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Periods</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => {
            setSearchTerm('');
            setCategoryFilter('all');
            setStatusFilter('all');
            setPeriodFilter('all');
          }}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      {/* Budget Table */}
      <div className="rounded-lg border glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Category</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Period Start</TableHead>
              <TableHead>Period End</TableHead>
              <TableHead>Allocated (₹)</TableHead>
              <TableHead>Actual Spent (₹)</TableHead>
              <TableHead>Remaining (₹)</TableHead>
              <TableHead>Variance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBudgets.map((budget) => (
              <TableRow key={budget.id} className="hover:bg-muted/30">
                <TableCell>
                  <Badge variant="outline" className="font-medium">
                    {getCategoryDisplay(budget.category)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="capitalize">{getPeriodDisplay(budget.time_period)}</span>
                </TableCell>
                <TableCell>
                  {format(new Date(budget.period_start), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  {format(new Date(budget.period_end), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(budget.budgeted_amount)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-orange-600">
                    {formatCurrency(budget.actual_amount)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`font-semibold ${
                    budget.remaining_amount < 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {formatCurrency(budget.remaining_amount)}
                  </span>
                </TableCell>
                <TableCell>
                  {getVarianceBadge(budget.variance_percentage)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(budget.status)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(budget)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(budget)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="modal-content">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Budget</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this budget? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(budget.id)}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {deleting ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredBudgets.length === 0 && budgets.length > 0 && (
        <div className="text-center py-8">
          <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No budgets match your filters</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};