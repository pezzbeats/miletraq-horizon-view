import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubsidiary } from '@/contexts/SubsidiaryContext';
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
        supabase.from('budget').select('budgeted_amount, actual_amount')
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

      // Mock chart data (replace with real data processing)
      const chartData = {
        fuelConsumption: [
          { date: '2024-01-01', fuel: 1200, cost: 120000 },
          { date: '2024-01-02', fuel: 1350, cost: 135000 },
          { date: '2024-01-03', fuel: 1100, cost: 110000 },
          { date: '2024-01-04', fuel: 1450, cost: 145000 },
          { date: '2024-01-05', fuel: 1300, cost: 130000 },
        ],
        costAnalysis: [
          { month: 'Jan', fuel: 450000, maintenance: 120000, parts: 80000 },
          { month: 'Feb', fuel: 420000, maintenance: 150000, parts: 90000 },
          { month: 'Mar', fuel: 480000, maintenance: 110000, parts: 70000 },
          { month: 'Apr', fuel: 510000, maintenance: 180000, parts: 95000 },
        ],
        vehicleEfficiency: [
          { vehicle: 'KA-01-AB-1234', efficiency: 12.5, target: 13.0 },
          { vehicle: 'KA-02-CD-5678', efficiency: 11.8, target: 12.5 },
          { vehicle: 'KA-03-EF-9012', efficiency: 13.2, target: 13.0 },
          { vehicle: 'KA-04-GH-3456', efficiency: 10.9, target: 12.0 },
        ],
        budgetPerformance: [
          { category: 'Fuel', budgeted: 500000, actual: 450000, variance: -10 },
          { category: 'Maintenance', budgeted: 200000, actual: 220000, variance: 10 },
          { category: 'Parts', budgeted: 100000, actual: 85000, variance: -15 },
          { category: 'Insurance', budgeted: 50000, actual: 48000, variance: -4 },
        ]
      };

      // Mock alerts
      const alerts = [
        {
          id: '1',
          type: 'document_expiry' as const,
          title: 'Documents Expiring Soon',
          message: '8 vehicle documents expiring in next 30 days across subsidiaries',
          severity: 'warning' as const,
          date: new Date().toISOString(),
          actionRequired: true,
          daysUntil: 15
        },
        {
          id: '2',
          type: 'budget_threshold' as const,
          title: 'Budget Threshold Exceeded',
          message: 'Construction subsidiary exceeded maintenance budget by 15%',
          severity: 'critical' as const,
          date: new Date().toISOString(),
          actionRequired: true
        },
        {
          id: '3',
          type: 'efficiency_drop' as const,
          title: 'Fleet Efficiency Drop',
          message: 'Overall fleet efficiency down 8% compared to last month',
          severity: 'warning' as const,
          date: new Date().toISOString()
        }
      ];

      // Mock activities
      const activities = [
        {
          id: '1',
          type: 'fuel_entry' as const,
          title: 'Bulk Fuel Purchase',
          description: 'Added 5000L fuel to central tank',
          user: 'Fuel Manager',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          metadata: { amount: 500000 }
        },
        {
          id: '2',
          type: 'maintenance' as const,
          title: 'Scheduled Maintenance',
          description: 'Monthly maintenance completed',
          user: 'Workshop Manager',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          metadata: { vehicleNumber: 'KA-01-AB-1234', amount: 15000 }
        }
      ];

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
          fuelCostTrend: 5.2,
          efficiencyTrend: -2.1,
          utilizationTrend: 8.7
        },
        charts: chartData,
        alerts,
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
            alerts={data.alerts}
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