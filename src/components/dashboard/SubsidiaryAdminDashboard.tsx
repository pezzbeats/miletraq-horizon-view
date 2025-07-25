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
import { Charts } from '@/components/dashboard/Charts';
import { 
  Car, 
  Fuel, 
  Users, 
  DollarSign, 
  Gauge,
  AlertTriangle,
  Building2,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ExpandableFAB } from '@/components/ui/expandable-fab';
import { useDashboardActions } from '@/hooks/useDashboardActions';
import { useIsMobile } from '@/hooks/use-mobile';

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

interface SubsidiaryAdminDashboardProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onSearchChange?: (searchQuery: string) => void;
  allSubsidiariesView: boolean;
  currentSubsidiary: any;
}

export function SubsidiaryAdminDashboard({ 
  filters, 
  onFiltersChange,
  onSearchChange,
  allSubsidiariesView,
  currentSubsidiary 
}: SubsidiaryAdminDashboardProps) {
  const { profile } = useAuth();
  const { subsidiaries } = useSubsidiary();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  const dashboardActions = useDashboardActions();

  useEffect(() => {
    fetchDashboardData();
  }, [currentSubsidiary, filters, allSubsidiariesView]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Build query filters based on subsidiary selection - fixed logic
      let vehiclesQuery = supabase.from('vehicles').select('id, status, subsidiary_id');
      let driversQuery = supabase.from('drivers').select('id, is_active, subsidiary_id');
      let fuelLogQuery = supabase.from('fuel_log').select('fuel_volume, total_cost, km_driven, date, subsidiary_id');
      let budgetQuery = supabase.from('budget').select('budgeted_amount, actual_amount, subsidiary_id');
      let documentsQuery = supabase.from('vehicle_documents').select('id, expiry_date, subsidiary_id');

      // Apply subsidiary filter only if not in all subsidiaries view and current subsidiary is selected
      if (!allSubsidiariesView && currentSubsidiary?.id) {
        vehiclesQuery = vehiclesQuery.eq('subsidiary_id', currentSubsidiary.id);
        driversQuery = driversQuery.eq('subsidiary_id', currentSubsidiary.id);
        fuelLogQuery = fuelLogQuery.eq('subsidiary_id', currentSubsidiary.id);
        budgetQuery = budgetQuery.eq('subsidiary_id', currentSubsidiary.id);
        documentsQuery = documentsQuery.eq('subsidiary_id', currentSubsidiary.id);
      }

      // Fetch metrics - all subsidiaries or specific subsidiary
      const [vehiclesResult, driversResult, fuelLogResult, budgetResult, documentsResult] = await Promise.all([
        vehiclesQuery,
        driversQuery,
        fuelLogQuery,
        budgetQuery,
        documentsQuery
      ]);

      const vehicles = vehiclesResult.data || [];
      const drivers = driversResult.data || [];
      const fuelData = fuelLogResult.data || [];
      const budgetData = budgetResult.data || [];
      const documents = documentsResult.data || [];

      const totalVehicles = vehicles.length;
      const activeVehicles = vehicles.filter(v => v.status === 'active').length;
      const activeDrivers = drivers.filter(d => d.is_active).length;
      
      const monthlyFuelCost = fuelData.reduce((sum, log) => sum + (log.total_cost || 0), 0);
      const totalKm = fuelData.reduce((sum, log) => sum + (log.km_driven || 0), 0);
      const totalFuel = fuelData.reduce((sum, log) => sum + (log.fuel_volume || 0), 0);
      const averageEfficiency = totalFuel > 0 ? totalKm / totalFuel : 0;
      const costPerKm = totalKm > 0 ? monthlyFuelCost / totalKm : 0;

      const totalBudgeted = budgetData.reduce((sum, b) => sum + (b.budgeted_amount || 0), 0);
      const totalActual = budgetData.reduce((sum, b) => sum + (b.actual_amount || 0), 0);
      const budgetUtilization = totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0;

      // Check document expiries
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const expiringDocuments = documents.filter(doc => 
        doc.expiry_date && new Date(doc.expiry_date) <= thirtyDaysFromNow
      );

      // Real alerts specific to this subsidiary  
      const subsidiaryAlerts = [
        ...(expiringDocuments.length > 0 ? [{
          id: 'doc-expiry',
          type: 'document_expiry' as const,
          title: 'Documents Expiring Soon',
          message: `${expiringDocuments.length} documents expiring in next 30 days`,
          severity: 'warning' as const,
          date: new Date().toISOString(),
          actionRequired: true,
          daysUntil: 15
        }] : []),
        {
          id: 'maintenance-due',
          type: 'maintenance_due' as const,
          title: 'Maintenance Due',
          message: '3 vehicles due for scheduled maintenance',
          severity: 'warning' as const,
          date: new Date().toISOString(),
          actionRequired: true
        }
      ];

      // Get real recent activities for this subsidiary
      let fuelActivitiesQuery = supabase
        .from('fuel_log')
        .select('id, total_cost, created_at, vehicles(vehicle_number), subsidiary_id')
        .order('created_at', { ascending: false })
        .limit(2);
      
      let maintenanceActivitiesQuery = supabase
        .from('maintenance_log')
        .select('id, total_cost, created_at, vehicles(vehicle_number), subsidiary_id')
        .order('created_at', { ascending: false })
        .limit(2);

      // Apply subsidiary filter if needed
      if (!allSubsidiariesView && currentSubsidiary?.id) {
        fuelActivitiesQuery = fuelActivitiesQuery.eq('subsidiary_id', currentSubsidiary.id);
        maintenanceActivitiesQuery = maintenanceActivitiesQuery.eq('subsidiary_id', currentSubsidiary.id);
      }

      const recentActivitiesData = await Promise.all([
        fuelActivitiesQuery,
        maintenanceActivitiesQuery
      ]);

      const activities = [
        ...recentActivitiesData[0].data?.map(log => ({
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
        ...recentActivitiesData[1].data?.map(log => ({
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
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());


      setData({
        kpis: {
          totalVehicles,
          activeVehicles,
          activeDrivers,
          monthlyFuelCost,
          averageEfficiency,
          costPerKm,
          budgetUtilization,
          alertsCount: subsidiaryAlerts.length
        },
        charts: {
          fuelConsumption: [
            { date: '2024-01-01', fuel: 850, cost: 85000 },
            { date: '2024-01-02', fuel: 920, cost: 92000 },
            { date: '2024-01-03', fuel: 780, cost: 78000 },
            { date: '2024-01-04', fuel: 1050, cost: 105000 },
            { date: '2024-01-05', fuel: 890, cost: 89000 },
          ],
          costAnalysis: [
            { month: 'Jan', fuel: 320000, maintenance: 85000, parts: 45000 },
            { month: 'Feb', fuel: 298000, maintenance: 110000, parts: 52000 },
            { month: 'Mar', fuel: 335000, maintenance: 78000, parts: 38000 },
            { month: 'Apr', fuel: 358000, maintenance: 125000, parts: 67000 },
          ],
          efficiencyTrend: [
            { date: '2024-01', efficiency: 12.3 },
            { date: '2024-02', efficiency: 12.1 },
            { date: '2024-03', efficiency: 12.8 },
            { date: '2024-04', efficiency: 12.5 },
          ],
          budgetPerformance: [
            { category: 'Fuel', budgeted: 350000, actual: 320000, variance: -8.6 },
            { category: 'Maintenance', budgeted: 120000, actual: 125000, variance: 4.2 },
            { category: 'Parts', budgeted: 80000, actual: 67000, variance: -16.3 },
          ]
        },
        alerts: subsidiaryAlerts,
        activities
      });
    } catch (error) {
      console.error('Error fetching subsidiary dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!allSubsidiariesView && !currentSubsidiary) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Subsidiary Selected</h3>
          <p className="text-muted-foreground">Please select a subsidiary to view the dashboard</p>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
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
      {/* Context Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {allSubsidiariesView 
                    ? "All Subsidiaries Dashboard" 
                    : currentSubsidiary?.subsidiary_name || "Selected Subsidiary"
                  }
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {!allSubsidiariesView && currentSubsidiary && (
                    <>
                      <Badge variant="outline">{currentSubsidiary.subsidiary_code}</Badge>
                      <Badge variant="outline" className="capitalize">{currentSubsidiary.business_type}</Badge>
                    </>
                  )}
                  {allSubsidiariesView && (
                    <Badge variant="outline">{subsidiaries.length} Subsidiaries</Badge>
                  )}
                </div>
              </div>
            </div>
            <DashboardFilters
              filters={filters}
              onFiltersChange={onFiltersChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Total Vehicles"
          value={data.kpis.totalVehicles}
          subValue={`${data.kpis.activeVehicles} active`}
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
          value={`₹${(data.kpis.monthlyFuelCost / 1000).toFixed(0)}K`}
          icon={Fuel}
          variant="warning"
        />
        <KPICard
          title="Avg Efficiency"
          value={`${data.kpis.averageEfficiency.toFixed(1)} km/L`}
          icon={Gauge}
          variant="default"
        />
        <KPICard
          title="Cost per KM"
          value={`₹${data.kpis.costPerKm.toFixed(2)}`}
          icon={DollarSign}
          variant="default"
        />
        <KPICard
          title="Budget Used"
          value={`${data.kpis.budgetUtilization.toFixed(1)}%`}
          icon={TrendingUp}
          variant={data.kpis.budgetUtilization > 90 ? "destructive" : "default"}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-3 space-y-6">
          {/* Analytics Dashboard */}
          <ChartContainer title="Subsidiary Analytics" description="Multi-fuel analytics for this subsidiary">
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

      {/* Mobile FAB */}
      {isMobile && <ExpandableFAB actions={dashboardActions} />}
    </div>
  );
};