import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Target,
  PieChart,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BudgetRecord } from '@/pages/Budget';

interface BudgetOverviewProps {
  budgets: BudgetRecord[];
  loading: boolean;
}

export const BudgetOverview = ({ budgets, loading }: BudgetOverviewProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="glass-card">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted/50 rounded"></div>
                <div className="h-8 bg-muted/50 rounded"></div>
                <div className="h-3 bg-muted/50 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate current period totals (active budgets)
  const activeBudgets = budgets.filter(b => b.status === 'active');
  const totalAllocated = activeBudgets.reduce((sum, b) => sum + b.budgeted_amount, 0);
  const totalActual = activeBudgets.reduce((sum, b) => sum + b.actual_amount, 0);
  const totalRemaining = activeBudgets.reduce((sum, b) => sum + b.remaining_amount, 0);
  
  // Calculate utilization percentage
  const utilizationPercentage = totalAllocated > 0 ? (totalActual / totalAllocated) * 100 : 0;
  
  // Calculate overall variance
  const overallVariance = totalAllocated > 0 ? ((totalActual - totalAllocated) / totalAllocated) * 100 : 0;
  
  // Count budgets by status
  const overBudgetCount = activeBudgets.filter(b => b.variance_percentage > 0).length;
  const nearLimitCount = activeBudgets.filter(b => 
    b.variance_percentage <= 0 && (b.actual_amount / b.budgeted_amount) >= 0.8
  ).length;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage > 100) return 'text-red-600';
    if (percentage > 80) return 'text-orange-600';
    if (percentage > 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 10) return 'text-red-600';
    if (variance > 0) return 'text-orange-600';
    if (variance > -10) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Main Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Allocated */}
        <Card className="card-info hover-lift hover-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Allocated</p>
                <p className="text-3xl font-bold gradient-text">{formatCurrency(totalAllocated)}</p>
                <div className="flex items-center space-x-1">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-muted-foreground">{activeBudgets.length} active budgets</span>
                </div>
              </div>
              <div className="relative">
                <div className="w-16 h-16 rounded-xl gradient-info flex items-center justify-center shadow-colored">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actual Spent */}
        <Card className="card-warning hover-lift hover-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Actual Spent</p>
                <p className="text-3xl font-bold gradient-text">{formatCurrency(totalActual)}</p>
                <div className="flex items-center space-x-1">
                  <Activity className="h-4 w-4 text-orange-600" />
                  <span className={`text-sm font-medium ${getUtilizationColor(utilizationPercentage)}`}>
                    {utilizationPercentage.toFixed(1)}% utilized
                  </span>
                </div>
              </div>
              <div className="relative">
                <div className="w-16 h-16 rounded-xl gradient-warning flex items-center justify-center shadow-warning">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Remaining Budget */}
        <Card className="card-success hover-lift hover-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Remaining</p>
                <p className="text-3xl font-bold gradient-text">{formatCurrency(totalRemaining)}</p>
                <div className="flex items-center space-x-1">
                  <PieChart className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">
                    {totalAllocated > 0 ? ((totalRemaining / totalAllocated) * 100).toFixed(1) : 0}% remaining
                  </span>
                </div>
              </div>
              <div className="relative">
                <div className="w-16 h-16 rounded-xl gradient-success flex items-center justify-center shadow-success">
                  <Target className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Variance Analysis */}
        <Card className="card-purple hover-lift hover-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Variance</p>
                <p className={`text-3xl font-bold ${getVarianceColor(overallVariance)}`}>
                  {overallVariance > 0 ? '+' : ''}{overallVariance.toFixed(1)}%
                </p>
                <div className="flex items-center space-x-1">
                  {overallVariance > 0 ? (
                    <TrendingUp className="h-4 w-4 text-red-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-600" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    vs allocated
                  </span>
                </div>
              </div>
              <div className="relative">
                <div className="w-16 h-16 rounded-xl gradient-purple flex items-center justify-center">
                  {overallVariance > 0 ? (
                    <AlertTriangle className="h-8 w-8 text-white" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-white" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Status Summary */}
      <Card className="card-info hover-lift">
        <CardHeader className="gradient-info text-white rounded-t-lg">
          <CardTitle className="text-white">Budget Status Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Budget Utilization */}
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">
                {utilizationPercentage.toFixed(0)}%
              </div>
              <div className="text-muted-foreground mb-4">Budget Utilization</div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    utilizationPercentage > 100 ? 'gradient-error' :
                    utilizationPercentage > 80 ? 'gradient-warning' :
                    'gradient-success'
                  }`}
                  style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Alert Status */}
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">{overBudgetCount}</div>
              <div className="text-muted-foreground mb-4">Over Budget</div>
              {overBudgetCount > 0 && (
                <Badge className="gradient-error text-white">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Requires Attention
                </Badge>
              )}
            </div>

            {/* Near Limit */}
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">{nearLimitCount}</div>
              <div className="text-muted-foreground mb-4">Near Limit (80%+)</div>
              {nearLimitCount > 0 && (
                <Badge className="gradient-warning text-white">
                  Monitor Closely
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {activeBudgets.length > 0 && (
        <Card className="card-purple hover-lift">
          <CardHeader className="gradient-purple text-white rounded-t-lg">
            <CardTitle className="text-white">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {['fuel', 'maintenance', 'parts'].map((category) => {
                const categoryBudgets = activeBudgets.filter(b => b.category === category);
                const categoryAllocated = categoryBudgets.reduce((sum, b) => sum + b.budgeted_amount, 0);
                const categoryActual = categoryBudgets.reduce((sum, b) => sum + b.actual_amount, 0);
                const categoryUtilization = categoryAllocated > 0 ? (categoryActual / categoryAllocated) * 100 : 0;

                if (categoryBudgets.length === 0) return null;

                return (
                  <div key={category} className="flex items-center justify-between p-4 glass-card rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{category.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="font-semibold capitalize">{category}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(categoryActual)} / {formatCurrency(categoryAllocated)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getUtilizationColor(categoryUtilization)}`}>
                        {categoryUtilization.toFixed(0)}%
                      </div>
                      <div className="text-sm text-muted-foreground">utilized</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};