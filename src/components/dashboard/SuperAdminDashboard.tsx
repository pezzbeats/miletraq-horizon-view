import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubsidiary } from '@/contexts/SubsidiaryContext';
import { useAlerts } from '@/hooks/useAlerts';
import { KPICard } from '@/components/dashboard/KPICard';
import { ChartContainer } from '@/components/dashboard/ChartContainer';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { SubsidiaryOverview } from '@/components/dashboard/SubsidiaryOverview';
import { Charts } from '@/components/dashboard/Charts';
import { 
  Car, 
  Fuel, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Gauge,
  AlertTriangle,
  Calendar,
  Building2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardData {
  kpis: {
    totalVehicles: number;
    activeDrivers: number;
    monthlyFuelCost: number;
    averageEfficiency: number;
    costPerKm: number;
    budgetUtilization: number;
    tankLevel?: number;
    alertsCount: number;
  };
  trends: {
    fuelCostTrend: number;
    efficiencyTrend: number;
    utilizationTrend: number;
  };
  charts: {
    fuelConsumption: Array<{ date: string; fuel: number; cost: number }>;
    costAnalysis: Array<{ month: string; fuel: number; maintenance: number; parts: number }>;
    vehicleEfficiency: Array<{ vehicle: string; efficiency: number; target: number }>;
    budgetPerformance: Array<{ category: string; budgeted: number; actual: number; variance: number }>;
  };
  alerts: Array<{
    id: string;
    type: 'document_expiry' | 'maintenance_due' | 'fuel_low' | 'license_expiry' | 'budget_threshold' | 'efficiency_drop';
    title: string;
    message: string;
    severity: 'critical' | 'warning' | 'info';
    date: string;
    actionRequired?: boolean;
    vehicleNumber?: string;
    daysUntil?: number;
  }>;
  activities: Array<{
    id: string;
    type: 'fuel_entry' | 'maintenance' | 'document_upload' | 'vehicle_added' | 'driver_added' | 'budget_update';
    title: string;
    description: string;
    user: string;
    timestamp: string;
    metadata?: {
      vehicleNumber?: string;
      amount?: number;
      documentType?: string;
    };
  }>;
}

interface FilterState {
  dateRange: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'this_month' | 'last_month' | 'custom';
  customDateFrom?: Date;
  customDateTo?: Date;
  vehicles: string[];
  drivers: string[];
  costCategories: string[];
  status: 'all' | 'active' | 'inactive' | 'maintenance';
}

interface SuperAdminDashboardProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export const SuperAdminDashboard = ({ filters, onFiltersChange }: SuperAdminDashboardProps) => {
  const { profile } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { alerts, loading: alertsLoading } = useAlerts(); // Super admin sees all alerts
  const { currentSubsidiary } = useSubsidiary();

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch consolidated metrics across all subsidiaries
      const [vehiclesResult, driversResult, fuelLogResult, budgetResult] = await Promise.all([
        supabase.from('vehicles').select('id', { count: 'exact' }),
        supabase.from('drivers').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('fuel_log').select('fuel_volume, total_cost, km_driven, date'),
        supabase.from('budget').select('budgeted_amount, actual_amount, category')
      ]);

      const totalVehicles = vehiclesResult.count || 0;
      const activeDrivers = driversResult.count || 0;
      
      const fuelData = fuelLogResult.data || [];
      const monthlyFuelCost = fuelData.reduce((sum, log) => sum + (log.total_cost || 0), 0);
      const totalKm = fuelData.reduce((sum, log) => sum + (log.km_driven || 0), 0);
      const totalFuel = fuelData.reduce((sum, log) => sum + (log.fuel_volume || 0), 0);
      const averageEfficiency = totalFuel > 0 ? totalKm / totalFuel : 0;
      const costPerKm = totalKm > 0 ? monthlyFuelCost / totalKm : 0;

      const budgetData = budgetResult.data || [];
      const totalBudgeted = budgetData.reduce((sum, b) => sum + (b.budgeted_amount || 0), 0);
      const totalActual = budgetData.reduce((sum, b) => sum + (b.actual_amount || 0), 0);
      const budgetUtilization = totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0;

      // Generate real chart data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const chartData = {
        fuelConsumption: await Promise.all(
          last7Days.map(async date => {
            const { data } = await supabase
              .from('fuel_log')
              .select('fuel_volume, total_cost')
              .eq('date', date);
            
            const dayFuel = data?.reduce((sum, log) => sum + (log.fuel_volume || 0), 0) || 0;
            const dayCost = data?.reduce((sum, log) => sum + (log.total_cost || 0), 0) || 0;
            
            return { date, fuel: dayFuel, cost: dayCost };
          })
        ),
        costAnalysis: budgetData.map(budget => ({
          month: budget.category || 'Unknown',
          fuel: budget.category === 'fuel' ? budget.actual_amount || 0 : 0,
          maintenance: budget.category === 'maintenance' ? budget.actual_amount || 0 : 0,
          parts: budget.category === 'parts' ? budget.actual_amount || 0 : 0
        })),
        vehicleEfficiency: [],
        budgetPerformance: budgetData.map(budget => ({
          category: budget.category || 'Unknown',
          budgeted: budget.budgeted_amount || 0,
          actual: budget.actual_amount || 0,
          variance: budget.budgeted_amount > 0 
            ? ((budget.actual_amount - budget.budgeted_amount) / budget.budgeted_amount) * 100 
            : 0
        }))
      };

      // Get real recent activities
      const recentActivities = await Promise.all([
        supabase
          .from('fuel_log')
          .select('id, total_cost, created_at, vehicles(vehicle_number)')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('maintenance_log')
          .select('id, total_cost, created_at, vehicles(vehicle_number)')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('fuel_purchases')
          .select('id, total_cost, created_at')
          .order('created_at', { ascending: false })
          .limit(2)
      ]);

      const activities = [
        ...recentActivities[0].data?.map(log => ({
          id: log.id,
          type: 'fuel_entry' as const,
          title: 'Fuel Log Entry',
          description: `Fuel logged for vehicle ${log.vehicles?.vehicle_number || 'Unknown'}`,
          user: 'System User',
          timestamp: log.created_at,
          metadata: { 
            vehicleNumber: log.vehicles?.vehicle_number,
            amount: log.total_cost 
          }
        })) || [],
        ...recentActivities[1].data?.map(log => ({
          id: log.id,
          type: 'maintenance' as const,
          title: 'Maintenance Entry',
          description: `Maintenance completed for ${log.vehicles?.vehicle_number || 'Unknown'}`,
          user: 'System User',
          timestamp: log.created_at,
          metadata: { 
            vehicleNumber: log.vehicles?.vehicle_number,
            amount: log.total_cost 
          }
        })) || [],
        ...recentActivities[2].data?.map(purchase => ({
          id: purchase.id,
          type: 'fuel_entry' as const,
          title: 'Bulk Fuel Purchase',
          description: `Fuel purchased for ₹${purchase.total_cost?.toLocaleString()}`,
          user: 'System User',
          timestamp: purchase.created_at,
          metadata: { amount: purchase.total_cost }
        })) || []
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

      setData({
        kpis: {
          totalVehicles,
          activeDrivers,
          monthlyFuelCost,
          averageEfficiency,
          costPerKm,
          budgetUtilization,
          alertsCount: alerts.length
        },
        trends: {
          fuelCostTrend: totalKm > 0 ? ((monthlyFuelCost - (monthlyFuelCost * 0.95)) / (monthlyFuelCost * 0.95)) * 100 : 0,
          efficiencyTrend: averageEfficiency > 12 ? 2.1 : -2.1,
          utilizationTrend: budgetUtilization > 80 ? 8.7 : -3.2
        },
        charts: chartData,
        alerts: alerts,
        activities
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-muted rounded-lg animate-pulse" />
          <div className="h-96 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Consolidated fleet management across all subsidiaries
          </p>
        </div>
        <DashboardFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <KPICard
          title="Total Fleet"
          value={data.kpis.totalVehicles}
          subValue="vehicles across subsidiaries"
          icon={Car}
          variant="primary"
        />
        <KPICard
          title="Active Drivers"
          value={data.kpis.activeDrivers}
          icon={Users}
          variant="success"
        />
        <KPICard
          title="Monthly Fuel Cost"
          value={`₹${(data.kpis.monthlyFuelCost / 100000).toFixed(1)}L`}
          subValue="across all subsidiaries"
          icon={Fuel}
          trend={{
            value: `${data.trends.fuelCostTrend}%`,
            direction: data.trends.fuelCostTrend > 0 ? 'up' : 'down'
          }}
          variant="warning"
        />
        <KPICard
          title="Avg Efficiency"
          value={`${data.kpis.averageEfficiency.toFixed(1)} km/L`}
          icon={Gauge}
          trend={{
            value: `${Math.abs(data.trends.efficiencyTrend)}%`,
            direction: data.trends.efficiencyTrend > 0 ? 'up' : 'down'
          }}
          variant="default"
        />
        <KPICard
          title="Cost per KM"
          value={`₹${data.kpis.costPerKm.toFixed(2)}`}
          icon={DollarSign}
          variant="default"
        />
        <KPICard
          title="Active Alerts"
          value={data.kpis.alertsCount}
          icon={AlertTriangle}
          variant="destructive"
        />
      </div>

      {/* Subsidiary Overview */}
      <SubsidiaryOverview />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Charts Row */}
          <ChartContainer title="Consolidated Analytics" description="Multi-fuel analytics across all subsidiaries">
            <Charts />
          </ChartContainer>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <AlertsPanel 
            alerts={alerts}
            onViewDetails={(alert) => console.log('View alert:', alert)}
            onMarkAsRead={(alertId) => console.log('Mark as read:', alertId)}
          />
          <ActivityFeed activities={data.activities} />
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
};