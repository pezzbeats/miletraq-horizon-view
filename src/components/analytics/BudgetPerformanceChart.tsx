import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
  Cell
} from "recharts";
import { format, parseISO } from "date-fns";

interface AnalyticsData {
  budgets: any[];
  fuelLogs: any[];
  maintenanceLogs: any[];
}

interface BudgetPerformanceChartProps {
  data: AnalyticsData;
  loading: boolean;
}

export const BudgetPerformanceChart = ({ data, loading }: BudgetPerformanceChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Performance</CardTitle>
          <CardDescription>Budget vs actual spending analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  // Process budget performance data
  const budgetPerformanceData = () => {
    return data.budgets
      .filter(budget => budget.budgeted_amount > 0)
      .map(budget => {
        const startDate = parseISO(budget.period_start);
        const endDate = parseISO(budget.period_end);
        
        // Calculate actual spending for this budget period
        let actualSpending = 0;
        
        if (budget.category === 'fuel') {
          actualSpending = data.fuelLogs
            .filter(log => {
              const logDate = parseISO(log.date);
              return logDate >= startDate && logDate <= endDate;
            })
            .reduce((sum, log) => sum + (log.total_cost || 0), 0);
        } else if (budget.category === 'maintenance') {
          actualSpending = data.maintenanceLogs
            .filter(log => {
              const logDate = parseISO(log.maintenance_date);
              return logDate >= startDate && logDate <= endDate;
            })
            .reduce((sum, log) => sum + (log.total_cost || 0), 0);
        }

        const variance = actualSpending - budget.budgeted_amount;
        const variancePercentage = budget.budgeted_amount > 0 ? (variance / budget.budgeted_amount) * 100 : 0;
        const utilization = budget.budgeted_amount > 0 ? (actualSpending / budget.budgeted_amount) * 100 : 0;

        return {
          id: budget.id,
          category: budget.category,
          period: `${format(startDate, 'MMM')} ${format(startDate, 'yyyy')}`,
          budgeted: budget.budgeted_amount,
          actual: actualSpending,
          variance,
          variancePercentage: parseFloat(variancePercentage.toFixed(1)),
          utilization: parseFloat(utilization.toFixed(1)),
          status: variance > 0 ? 'over' : variance < -budget.budgeted_amount * 0.1 ? 'under' : 'on-track'
        };
      })
      .sort((a, b) => a.period.localeCompare(b.period));
  };

  // Budget variance analysis
  const varianceAnalysisData = () => {
    const performanceData = budgetPerformanceData();
    
    // Group by category
    const categoryVariance: Record<string, { category: string; totalBudgeted: number; totalActual: number; variance: number }> = {};
    
    performanceData.forEach(budget => {
      if (!categoryVariance[budget.category]) {
        categoryVariance[budget.category] = {
          category: budget.category,
          totalBudgeted: 0,
          totalActual: 0,
          variance: 0
        };
      }
      
      categoryVariance[budget.category].totalBudgeted += budget.budgeted;
      categoryVariance[budget.category].totalActual += budget.actual;
      categoryVariance[budget.category].variance += budget.variance;
    });

    return Object.values(categoryVariance).map(category => ({
      ...category,
      variancePercentage: category.totalBudgeted > 0 ? 
        (category.variance / category.totalBudgeted) * 100 : 0
    }));
  };

  const performanceData = budgetPerformanceData();
  const varianceData = varianceAnalysisData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Performance</CardTitle>
        <CardDescription>
          Budget vs actual spending analysis and variance tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget vs Actual Spending */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Budget vs Actual Spending</h3>
          {performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={performanceData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis 
                  label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `₹${value.toLocaleString('en-IN')}`,
                    name === 'budgeted' ? 'Budgeted' : 'Actual Spending'
                  ]}
                  labelFormatter={(label) => `Period: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="budgeted" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                  name="Budgeted"
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Actual"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium">No budget performance data available</p>
                <p className="text-sm">Create budgets and record expenses to track performance</p>
              </div>
            </div>
          )}
        </div>

        {/* Variance Analysis by Category */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Variance Analysis by Category</h3>
          {varianceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={varianceData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis 
                  label={{ value: 'Variance (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Variance']}
                  labelFormatter={(label) => `Category: ${label}`}
                />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
                <Bar dataKey="variancePercentage" name="Variance %">
                  {varianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.variancePercentage > 0 ? "#ff6b6b" : "#51cf66"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium">No variance analysis data available</p>
                <p className="text-sm">Multiple budget periods needed for variance analysis</p>
              </div>
            </div>
          )}
        </div>

        {/* Budget Utilization Progress */}
        {performanceData.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Current Budget Utilization</h3>
            <div className="space-y-3">
              {performanceData.slice(-3).map((budget) => (
                <div key={budget.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {budget.category} - {budget.period}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {budget.utilization.toFixed(1)}% used
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        budget.utilization > 100 ? 'bg-red-500' : 
                        budget.utilization > 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(budget.utilization, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>₹{budget.actual.toLocaleString('en-IN')} spent</span>
                    <span>₹{budget.budgeted.toLocaleString('en-IN')} budgeted</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Budget Summary */}
        {performanceData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {performanceData.length}
              </div>
              <div className="text-sm text-muted-foreground">Budget Periods</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                ₹{performanceData.reduce((sum, b) => sum + b.budgeted, 0).toLocaleString('en-IN')}
              </div>
              <div className="text-sm text-muted-foreground">Total Budgeted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                ₹{performanceData.reduce((sum, b) => sum + b.actual, 0).toLocaleString('en-IN')}
              </div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                performanceData.reduce((sum, b) => sum + b.variance, 0) > 0 ? 'text-red-500' : 'text-green-500'
              }`}>
                {performanceData.reduce((sum, b) => sum + b.variance, 0) > 0 ? '+' : ''}
                ₹{performanceData.reduce((sum, b) => sum + b.variance, 0).toLocaleString('en-IN')}
              </div>
              <div className="text-sm text-muted-foreground">Total Variance</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};