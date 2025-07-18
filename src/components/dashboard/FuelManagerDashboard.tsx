import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubsidiary } from '@/contexts/SubsidiaryContext';
import { useAlerts } from '@/hooks/useAlerts';
import { KPICard } from '@/components/dashboard/KPICard';
import { ChartContainer } from '@/components/dashboard/ChartContainer';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { Charts } from '@/components/dashboard/Charts';
import { 
  Fuel, 
  Gauge,
  DollarSign,
  TrendingUp,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface FilterState {
  dateRange: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'this_month' | 'last_month' | 'custom';
  customDateFrom?: Date;
  customDateTo?: Date;
  vehicles: string[];
  drivers: string[];
  costCategories: string[];
  status: 'all' | 'active' | 'inactive' | 'maintenance';
}

interface FuelManagerDashboardProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export const FuelManagerDashboard = ({ filters, onFiltersChange }: FuelManagerDashboardProps) => {
  const { profile } = useAuth();
  const { currentSubsidiary } = useSubsidiary();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentSubsidiary) {
      fetchFuelDashboardData();
    }
  }, [currentSubsidiary, filters]);

  const fetchFuelDashboardData = async () => {
    if (!currentSubsidiary) return;

    try {
      setLoading(true);

      // Fetch fuel-specific metrics
      const [fuelLogResult, fuelPurchasesResult, tankResult] = await Promise.all([
        supabase.from('fuel_log').select('fuel_volume, total_cost, rate_per_liter, date, fuel_source').eq('subsidiary_id', currentSubsidiary.id),
        supabase.from('fuel_purchases').select('volume, total_cost, rate_per_liter, purchase_date').eq('subsidiary_id', currentSubsidiary.id),
        supabase.from('fuel_tank').select('current_level, capacity, low_level_threshold').eq('subsidiary_id', currentSubsidiary.id).single()
      ]);

      const fuelLogs = fuelLogResult.data || [];
      const fuelPurchases = fuelPurchasesResult.data || [];
      const tankData = tankResult.data;

      // Calculate fuel metrics
      const dailyConsumption = fuelLogs.reduce((sum, log) => sum + (log.fuel_volume || 0), 0);
      const fuelCostToday = fuelLogs.reduce((sum, log) => sum + (log.total_cost || 0), 0);
      const monthlyFuelBudget = 500000; // Mock budget
      const budgetUsed = (fuelCostToday / monthlyFuelBudget) * 100;

      // Average fuel efficiency
      const totalFuel = fuelLogs.reduce((sum, log) => sum + (log.fuel_volume || 0), 0);
      const avgRatePerLiter = totalFuel > 0 ? fuelLogs.reduce((sum, log) => sum + (log.rate_per_liter || 0), 0) / fuelLogs.length : 0;

      // Tank calculations
      const currentLevel = tankData?.current_level || 3000;
      const capacity = tankData?.capacity || 10000;
      const lowThreshold = tankData?.low_level_threshold || 1000;
      const daysRemaining = dailyConsumption > 0 ? Math.floor(currentLevel / (dailyConsumption / 30)) : 0;

      // Mock alerts
      const alerts = [
        ...(currentLevel <= lowThreshold ? [{
          id: 'tank-low',
          type: 'fuel_low' as const,
          title: 'Low Fuel Tank Level',
          message: `Tank level is at ${((currentLevel / capacity) * 100).toFixed(1)}% - Consider refilling`,
          severity: 'warning' as const,
          date: new Date().toISOString(),
          actionRequired: true
        }] : []),
        {
          id: 'price-increase',
          type: 'budget_threshold' as const,
          title: 'Fuel Price Increase',
          message: 'Fuel prices increased by ₹2/L compared to last week',
          severity: 'info' as const,
          date: new Date().toISOString()
        }
      ];

      // Fuel-specific activities
      const activities = [
        {
          id: '1',
          type: 'fuel_entry' as const,
          title: 'Fuel Purchase Recorded',
          description: 'Added 2000L fuel to tank',
          user: profile?.full_name || 'Fuel Manager',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          metadata: { amount: 200000 }
        },
        {
          id: '2',
          type: 'fuel_entry' as const,
          title: 'Vehicle Refueling',
          description: 'KA-01-AB-1234 refueled with 45L',
          user: 'Driver',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          metadata: { vehicleNumber: 'KA-01-AB-1234', amount: 4500 }
        }
      ];

      setData({
        kpis: {
          dailyConsumption,
          fuelCostToday,
          budgetUsed,
          avgRatePerLiter,
          currentLevel,
          capacity,
          daysRemaining,
          alertsCount: alerts.length
        },
        tank: {
          currentLevel,
          capacity,
          lowThreshold
        },
        charts: {
          fuelConsumption: [
            { date: '2024-01-01', fuel: 450, cost: 45000 },
            { date: '2024-01-02', fuel: 520, cost: 52000 },
            { date: '2024-01-03', fuel: 380, cost: 38000 },
            { date: '2024-01-04', fuel: 610, cost: 61000 },
            { date: '2024-01-05', fuel: 490, cost: 49000 },
          ],
          costAnalysis: [
            { month: 'Jan', fuel: 450000, maintenance: 0, parts: 0 },
            { month: 'Feb', fuel: 420000, maintenance: 0, parts: 0 },
            { month: 'Mar', fuel: 480000, maintenance: 0, parts: 0 },
            { month: 'Apr', fuel: 510000, maintenance: 0, parts: 0 },
          ]
        },
        alerts,
        activities
      });
    } catch (error) {
      console.error('Error fetching fuel dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Fuel Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Fuel operations and tank management for {currentSubsidiary?.subsidiary_name}
          </p>
        </div>
        <DashboardFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Tank Level"
          value={`${((data.tank.currentLevel / data.tank.capacity) * 100).toFixed(1)}%`}
          subValue={`${data.tank.currentLevel.toLocaleString()}L`}
          icon={Fuel}
          variant={data.tank.currentLevel <= data.tank.lowThreshold ? "destructive" : "primary"}
        />
        <KPICard
          title="Daily Consumption"
          value={`${data.kpis.dailyConsumption.toFixed(0)}L`}
          icon={Gauge}
          variant="default"
        />
        <KPICard
          title="Fuel Cost Today"
          value={`₹${(data.kpis.fuelCostToday / 1000).toFixed(0)}K`}
          icon={DollarSign}
          variant="warning"
        />
        <KPICard
          title="Avg Rate/Liter"
          value={`₹${data.kpis.avgRatePerLiter.toFixed(2)}`}
          icon={BarChart3}
          variant="default"
        />
        <KPICard
          title="Budget Used"
          value={`${data.kpis.budgetUsed.toFixed(1)}%`}
          icon={TrendingUp}
          variant={data.kpis.budgetUsed > 80 ? "destructive" : "success"}
        />
        <KPICard
          title="Days Remaining"
          value={`${data.kpis.daysRemaining}`}
          subValue="at current rate"
          icon={AlertTriangle}
          variant={data.kpis.daysRemaining < 7 ? "destructive" : "default"}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Charts and Tank Section */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tank Management Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fuel className="h-5 w-5 text-blue-500" />
                Tank Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {((data.tank.currentLevel / data.tank.capacity) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Tank Level</div>
                  </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Current Level</p>
                      <p className="text-2xl font-bold">{data.tank.currentLevel.toLocaleString()}L</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Capacity</p>
                      <p className="text-2xl font-bold">{data.tank.capacity.toLocaleString()}L</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Days Remaining</p>
                      <p className="text-2xl font-bold">{data.kpis.daysRemaining}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Low Threshold</p>
                      <p className="text-2xl font-bold">{data.tank.lowThreshold.toLocaleString()}L</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">Record Purchase</Button>
                    <Button size="sm" variant="outline" className="flex-1">Update Reading</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer title="Fuel Analytics" description="Fuel consumption and cost trends">
              <Charts />
            </ChartContainer>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <AlertsPanel 
            alerts={data.alerts}
            onViewDetails={(alert) => console.log('View alert:', alert)}
            onMarkAsRead={(alertId) => console.log('Mark as read:', alertId)}
          />
          <ActivityFeed activities={data.activities} />
        </div>
      </div>

      {/* Quick Fuel Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Fuel Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button className="h-20 flex-col gap-2">
              <Fuel className="h-5 w-5" />
              <span className="text-xs">Record Purchase</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Gauge className="h-5 w-5" />
              <span className="text-xs">Add Fuel Log</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs">Update Tank</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs">Fuel Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};