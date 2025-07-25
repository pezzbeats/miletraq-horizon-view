import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubsidiary } from '@/contexts/SubsidiaryContext';
import { useAlerts } from '@/hooks/useAlerts';
import { ModernKPICard } from '@/components/dashboard/ModernKPICard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ModernSubsidiaryCard } from '@/components/dashboard/ModernSubsidiaryCard';
import { ChartContainer } from '@/components/dashboard/ChartContainer';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { Charts } from '@/components/dashboard/Charts';
import { 
  Car, 
  Fuel, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Gauge,
  AlertTriangle,
  Building2,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ExpandableFAB } from '@/components/ui/expandable-fab';
import { useDashboardActions } from '@/hooks/useDashboardActions';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DashboardData {
  kpis: {
    totalVehicles: number;
    activeDrivers: number;
    monthlyFuelCost: number;
    averageEfficiency: number;
    costPerKm: number;
    budgetUtilization: number;
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
  subsidiaries: Array<{
    id: string;
    name: string;
    code: string;
    businessType: string;
    metrics: {
      totalVehicles: number;
      activeVehicles: number;
      maintenanceVehicles: number;
      inactiveVehicles: number;
      totalDrivers: number;
      alertsCount: number;
      criticalAlerts: number;
      monthlyFuelCost: number;
      efficiency: number;
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
  searchQuery?: string;
}

interface SuperAdminDashboardProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onSearchChange?: (searchQuery: string) => void;
  allSubsidiariesView: boolean;
  currentSubsidiary: any;
}

export const SuperAdminDashboard = ({ filters, onFiltersChange, onSearchChange, allSubsidiariesView, currentSubsidiary }: SuperAdminDashboardProps) => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { subsidiaries, setCurrentSubsidiary } = useSubsidiary();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();
  const dashboardActions = useDashboardActions();

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearchChange?.(query);
  };
  const { alerts, loading: alertsLoading } = useAlerts();

  useEffect(() => {
    fetchDashboardData();
  }, [filters, currentSubsidiary, allSubsidiariesView]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Build query filters based on subsidiary selection - fixed logic
      let vehiclesQuery = supabase.from('vehicles').select('id, subsidiary_id, status', { count: 'exact' });
      let driversQuery = supabase.from('drivers').select('id, subsidiary_id', { count: 'exact' }).eq('is_active', true);
      let fuelLogQuery = supabase.from('fuel_log').select('fuel_volume, total_cost, km_driven, date, subsidiary_id');
      let budgetQuery = supabase.from('budget').select('budgeted_amount, actual_amount, category, subsidiary_id');

      // Apply subsidiary filter only if not in all subsidiaries view and current subsidiary is selected
      if (!allSubsidiariesView && currentSubsidiary?.id) {
        vehiclesQuery = vehiclesQuery.eq('subsidiary_id', currentSubsidiary.id);
        driversQuery = driversQuery.eq('subsidiary_id', currentSubsidiary.id);
        fuelLogQuery = fuelLogQuery.eq('subsidiary_id', currentSubsidiary.id);
        budgetQuery = budgetQuery.eq('subsidiary_id', currentSubsidiary.id);
      }

      // Fetch metrics - all subsidiaries or specific subsidiary
      const [vehiclesResult, driversResult, fuelLogResult, budgetResult] = await Promise.all([
        vehiclesQuery,
        driversQuery,
        fuelLogQuery,
        budgetQuery
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

      // Generate subsidiary metrics only for "All Subsidiaries" view
      const subsidiaryMetrics = allSubsidiariesView ? await Promise.all(
        subsidiaries.map(async (sub) => {
          const [subVehicles, subDrivers, subFuel, subAlerts] = await Promise.all([
            supabase.from('vehicles').select('id, status').eq('subsidiary_id', sub.id),
            supabase.from('drivers').select('id').eq('subsidiary_id', sub.id).eq('is_active', true),
            supabase.from('fuel_log').select('total_cost, fuel_volume, km_driven').eq('subsidiary_id', sub.id),
            supabase.from('vehicle_documents').select('id, expiry_date').eq('subsidiary_id', sub.id)
          ]);

          const vehicles = subVehicles.data || [];
          const fuel = subFuel.data || [];
          const totalSubFuel = fuel.reduce((sum, f) => sum + (f.fuel_volume || 0), 0);
          const totalSubKm = fuel.reduce((sum, f) => sum + (f.km_driven || 0), 0);
          
          return {
            id: sub.id,
            name: sub.subsidiary_name,
            code: sub.subsidiary_code,
            businessType: sub.business_type,
            metrics: {
              totalVehicles: vehicles.length,
              activeVehicles: vehicles.filter(v => v.status === 'active').length,
              maintenanceVehicles: vehicles.filter(v => v.status === 'maintenance').length,
              inactiveVehicles: vehicles.filter(v => v.status === 'inactive').length,
              totalDrivers: subDrivers.data?.length || 0,
              alertsCount: Math.floor(Math.random() * 5), // Placeholder
              criticalAlerts: Math.floor(Math.random() * 2),
              monthlyFuelCost: fuel.reduce((sum, f) => sum + (f.total_cost || 0), 0),
              efficiency: totalSubFuel > 0 ? totalSubKm / totalSubFuel : 0
            }
          };
        })
      ) : [];

      // Generate chart data
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

      // Get recent activities
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
          fuelCostTrend: 8.5,
          efficiencyTrend: 2.1,
          utilizationTrend: budgetUtilization > 80 ? 8.7 : -3.2
        },
        charts: chartData,
        alerts: alerts,
        activities,
        subsidiaries: subsidiaryMetrics
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubsidiaryView = (subsidiaryId: string) => {
    navigate(`/subsidiaries/${subsidiaryId}`);
  };

  const handleSubsidiarySwitchTo = (subsidiaryId: string) => {
    const subsidiary = subsidiaries.find(s => s.id === subsidiaryId);
    if (subsidiary) {
      setCurrentSubsidiary(subsidiary);
      navigate('/dashboard');
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <DashboardHeader
          title="Super Admin Dashboard"
          subtitle="Loading consolidated fleet management data..."
          alertsCount={0}
        />
        <div className="container mx-auto p-6 space-y-6">
          {/* Loading KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[140px] bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
          
          {/* Loading Subsidiary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[300px] bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
          
          {/* Loading Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[400px] bg-muted/50 rounded-xl animate-pulse" />
            <div className="h-[400px] bg-muted/50 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <DashboardHeader
          title="Super Admin Dashboard"
          subtitle={allSubsidiariesView 
            ? "Consolidated fleet management across all subsidiaries" 
            : `Fleet management for ${currentSubsidiary?.subsidiary_name || 'Selected Subsidiary'}`}
          alertsCount={data.kpis.alertsCount}
          showSearch={true}
          onSearchChange={handleSearchChange}
        />

      <div className="container mx-auto p-6 space-y-8">
        {/* Modern KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <ModernKPICard
            title="Total Fleet"
            value={data.kpis.totalVehicles}
            subtitle="vehicles"
            tertiary="across all subsidiaries"
            icon={Car}
            gradient="blue"
            onClick={() => navigate('/vehicles')}
            animateValue={true}
          />
          
          <ModernKPICard
            title="Active Drivers"
            value={data.kpis.activeDrivers}
            subtitle="drivers"
            tertiary="currently active"
            icon={Users}
            gradient="green"
            onClick={() => navigate('/drivers')}
            animateValue={true}
          />
          
          <ModernKPICard
            title="Monthly Fuel Cost"
            value={`₹${(data.kpis.monthlyFuelCost / 100000).toFixed(1)}L`}
            subtitle="fuel cost"
            tertiary="this month"
            icon={Fuel}
            gradient="orange"
            trend={{
              value: data.trends.fuelCostTrend,
              direction: data.trends.fuelCostTrend > 0 ? 'up' : 'down',
              period: 'vs last month'
            }}
            progress={75}
            onClick={() => navigate('/fuel-log')}
          />
          
          <ModernKPICard
            title="Avg Efficiency"
            value={`${data.kpis.averageEfficiency.toFixed(1)}`}
            subtitle="km/L"
            tertiary="fleet average"
            icon={Gauge}
            gradient="purple"
            trend={{
              value: data.trends.efficiencyTrend,
              direction: data.trends.efficiencyTrend > 0 ? 'up' : 'down',
              comparison: '2.1% vs target'
            }}
          />
          
          <ModernKPICard
            title="Cost per KM"
            value={`₹${data.kpis.costPerKm.toFixed(2)}`}
            subtitle="per km"
            tertiary="15% below industry avg"
            icon={DollarSign}
            gradient="teal"
          />
          
          <ModernKPICard
            title="Active Alerts"
            value={data.kpis.alertsCount}
            subtitle="alerts"
            tertiary={`${alerts.filter(a => a.severity === 'critical').length} critical`}
            icon={AlertTriangle}
            gradient={data.kpis.alertsCount > 0 ? "red" : "green"}
            onClick={() => navigate('/alerts')}
            animateValue={true}
          />
        </div>

        {/* Subsidiary Overview Section - Only show in "All Subsidiaries" view */}
        {allSubsidiariesView && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Building2 className="h-6 w-6" />
                  Subsidiary Overview
                </h2>
                <p className="text-muted-foreground">
                  Performance metrics across all business units
                </p>
              </div>
              <Badge variant="outline" className="text-sm">
                {data.subsidiaries.length} Active Subsidiaries
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {data.subsidiaries.map((subsidiary) => (
                <ModernSubsidiaryCard
                  key={subsidiary.id}
                  id={subsidiary.id}
                  name={subsidiary.name}
                  code={subsidiary.code}
                  businessType={subsidiary.businessType}
                  metrics={subsidiary.metrics}
                  onView={handleSubsidiaryView}
                  onSwitchTo={handleSubsidiarySwitchTo}
                />
              ))}
            </div>
          </div>
        )}

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Charts Section */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Charts />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <AlertsPanel 
              alerts={alerts.slice(0, 5)}
              onViewDetails={(alert) => console.log('View alert:', alert)}
              onMarkAsRead={(alertId) => console.log('Mark as read:', alertId)}
            />
            <ActivityFeed activities={data.activities} />
          </div>
        </div>

        {/* Mobile FAB */}
        {isMobile && <ExpandableFAB actions={dashboardActions} />}
      </div>
    </div>
  );
};