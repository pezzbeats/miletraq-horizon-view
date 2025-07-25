
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubsidiary } from '@/contexts/SubsidiaryContext';
import { MobileKPICard } from '@/components/ui/mobile-card';
import { MobileFAB } from '@/components/ui/mobile-fab';
import { MobileChartCarousel } from '@/components/ui/mobile-chart';
import { SubsidiarySelector } from '@/components/subsidiary/SubsidiarySelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Car, 
  Fuel, 
  Wrench, 
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Plus,
  RefreshCw
} from 'lucide-react';

export function MobileDashboard() {
  const { profile } = useAuth();
  const { currentSubsidiary, allSubsidiariesView } = useSubsidiary();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    vehicles: { active: 0, total: 0 },
    drivers: { active: 0 },
    fuelCost: { current: 0, change: 0 },
    maintenance: { pending: 0 },
    alerts: { count: 0 },
    recentActivity: []
  });

  const fetchDashboardData = async () => {
    try {
      const subsidiaryId = currentSubsidiary?.id;
      const isAllSubsidiariesView = allSubsidiariesView;
      
      let vehiclesQuery = supabase.from('vehicles').select('status');
      let driversQuery = supabase.from('drivers').select('is_active').eq('is_active', true);
      let fuelLogsQuery = supabase.from('fuel_log').select('total_cost');
      let maintenanceAlertsQuery = supabase.from('scheduled_maintenance_alerts').select('*').eq('is_acknowledged', false);
      let recentFuelQuery = supabase.from('fuel_log').select('*, vehicles(vehicle_number)').order('created_at', { ascending: false }).limit(5);
      let recentMaintenanceQuery = supabase.from('maintenance_log').select('*, vehicles(vehicle_number)').order('created_at', { ascending: false }).limit(5);

      // Apply subsidiary filtering based on view mode
      if (!isAllSubsidiariesView && subsidiaryId) {
        // Single subsidiary view
        vehiclesQuery = vehiclesQuery.eq('subsidiary_id', subsidiaryId);
        driversQuery = driversQuery.eq('subsidiary_id', subsidiaryId);
        fuelLogsQuery = fuelLogsQuery.eq('subsidiary_id', subsidiaryId);
        maintenanceAlertsQuery = maintenanceAlertsQuery.eq('subsidiary_id', subsidiaryId);
        recentFuelQuery = recentFuelQuery.eq('subsidiary_id', subsidiaryId);
        recentMaintenanceQuery = recentMaintenanceQuery.eq('subsidiary_id', subsidiaryId);
      } else if (isAllSubsidiariesView && profile?.is_super_admin) {
        // All subsidiaries view for super admin - no filtering
        // Queries will fetch from all subsidiaries
      } else if (isAllSubsidiariesView && !profile?.is_super_admin) {
        // All subsidiaries view for regular user - filter by accessible subsidiaries
        const { data: userSubsidiaries } = await supabase.rpc('get_user_accessible_subsidiaries');
        if (userSubsidiaries && userSubsidiaries.length > 0) {
          vehiclesQuery = vehiclesQuery.in('subsidiary_id', userSubsidiaries);
          driversQuery = driversQuery.in('subsidiary_id', userSubsidiaries);
          fuelLogsQuery = fuelLogsQuery.in('subsidiary_id', userSubsidiaries);
          maintenanceAlertsQuery = maintenanceAlertsQuery.in('subsidiary_id', userSubsidiaries);
          recentFuelQuery = recentFuelQuery.in('subsidiary_id', userSubsidiaries);
          recentMaintenanceQuery = recentMaintenanceQuery.in('subsidiary_id', userSubsidiaries);
        }
      } else {
        // Fallback to user's default subsidiary
        const defaultSubsidiaryId = profile?.default_subsidiary_id;
        if (defaultSubsidiaryId) {
          vehiclesQuery = vehiclesQuery.eq('subsidiary_id', defaultSubsidiaryId);
          driversQuery = driversQuery.eq('subsidiary_id', defaultSubsidiaryId);
          fuelLogsQuery = fuelLogsQuery.eq('subsidiary_id', defaultSubsidiaryId);
          maintenanceAlertsQuery = maintenanceAlertsQuery.eq('subsidiary_id', defaultSubsidiaryId);
          recentFuelQuery = recentFuelQuery.eq('subsidiary_id', defaultSubsidiaryId);
          recentMaintenanceQuery = recentMaintenanceQuery.eq('subsidiary_id', defaultSubsidiaryId);
        }
      }

      // Add date filter for fuel cost (current month)
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      fuelLogsQuery = fuelLogsQuery.gte('date', currentMonth + '-01');
      
      // Execute all queries
      const [
        { data: vehicles },
        { data: drivers },
        { data: fuelLogs },
        { data: maintenanceAlerts },
        { data: recentFuel },
        { data: recentMaintenance }
      ] = await Promise.all([
        vehiclesQuery,
        driversQuery,
        fuelLogsQuery,
        maintenanceAlertsQuery,
        recentFuelQuery,
        recentMaintenanceQuery
      ]);
      
      const activeVehicles = vehicles?.filter(v => v.status === 'active').length || 0;
      const totalVehicles = vehicles?.length || 0;
      const activeDrivers = drivers?.length || 0;
      const fuelCost = fuelLogs?.reduce((sum, log) => sum + (log.total_cost || 0), 0) || 0;
      const pendingMaintenance = maintenanceAlerts?.length || 0;

      // Format recent activity
      const activity = [];
      if (recentFuel) {
        activity.push(...recentFuel.map(log => ({
          title: `Vehicle ${log.vehicles?.vehicle_number || 'Unknown'} refueled`,
          time: formatTimeAgo(log.created_at),
          type: 'fuel'
        })));
      }
      if (recentMaintenance) {
        activity.push(...recentMaintenance.map(log => ({
          title: `Maintenance for ${log.vehicles?.vehicle_number || 'Unknown'}`,
          time: formatTimeAgo(log.created_at),
          type: 'maintenance'
        })));
      }

      // Sort by time and take top 5
      activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      setDashboardData({
        vehicles: { active: activeVehicles, total: totalVehicles },
        drivers: { active: activeDrivers },
        fuelCost: { current: fuelCost, change: 0 }, // TODO: Calculate month-over-month change
        maintenance: { pending: pendingMaintenance },
        alerts: { count: pendingMaintenance },
        recentActivity: activity.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Less than an hour ago';
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentSubsidiary, allSubsidiariesView, profile]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-vehicle':
        navigate('/vehicles');
        break;
      case 'add-fuel':
        navigate('/fuel-log');
        break;
      case 'add-maintenance':
        navigate('/maintenance');
        break;
      case 'add-driver':
        navigate('/drivers');
        break;
      case 'quick-add':
        // Show a quick action menu or navigate to most relevant page
        navigate('/vehicles');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handleKPIClick = (title: string) => {
    switch (title) {
      case 'Active Vehicles':
        navigate('/vehicles');
        break;
      case 'Fuel Cost':
        navigate('/fuel-log');
        break;
      case 'Maintenance':
        navigate('/maintenance');
        break;
      case 'Drivers':
        navigate('/drivers');
        break;
      case 'Total Expenses':
        navigate('/budget');
        break;
      case 'Alerts':
        navigate('/maintenance');
        break;
      default:
        console.log('Unknown KPI:', title);
    }
  };

  // Generate KPI data from real data
  const kpiData = [
    {
      title: 'Active Vehicles',
      value: dashboardData.vehicles.active.toString(),
      subValue: `of ${dashboardData.vehicles.total} total`,
      icon: Car,
      trend: dashboardData.vehicles.total > 0 ? { 
        value: `${Math.round((dashboardData.vehicles.active / dashboardData.vehicles.total) * 100)}%`, 
        isPositive: true 
      } : undefined,
      variant: 'primary' as const,
      onClick: () => handleKPIClick('Active Vehicles')
    },
    {
      title: 'Fuel Cost',
      value: `₹${(dashboardData.fuelCost.current / 1000).toFixed(1)}K`,
      subValue: 'this month',
      icon: Fuel,
      variant: 'warning' as const,
      onClick: () => handleKPIClick('Fuel Cost')
    },
    {
      title: 'Maintenance',
      value: dashboardData.maintenance.pending.toString(),
      subValue: 'pending tasks',
      icon: Wrench,
      variant: dashboardData.maintenance.pending > 0 ? 'destructive' as const : 'success' as const,
      onClick: () => handleKPIClick('Maintenance')
    },
    {
      title: 'Drivers',
      value: dashboardData.drivers.active.toString(),
      subValue: 'active drivers',
      icon: Users,
      variant: 'success' as const,
      onClick: () => handleKPIClick('Drivers')
    },
    {
      title: 'Total Expenses',
      value: `₹${(dashboardData.fuelCost.current / 100000).toFixed(1)}L`,
      subValue: 'this month',
      icon: DollarSign,
      variant: 'default' as const,
      onClick: () => handleKPIClick('Total Expenses')
    },
    {
      title: 'Alerts',
      value: dashboardData.alerts.count.toString(),
      subValue: 'require attention',
      icon: AlertTriangle,
      variant: dashboardData.alerts.count > 0 ? 'warning' as const : 'success' as const,
      onClick: () => handleKPIClick('Alerts')
    }
  ];

  const quickActions = [
    { label: 'Add Vehicle', action: 'add-vehicle', icon: Car },
    { label: 'Fuel Entry', action: 'add-fuel', icon: Fuel },
    { label: 'Maintenance', action: 'add-maintenance', icon: Wrench },
    { label: 'Add Driver', action: 'add-driver', icon: Users }
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Header with subsidiary selector for super admin */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">📊 Dashboard</h1>
            <p className="text-foreground opacity-75 font-medium">
              Fleet overview and key metrics
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="touch-target"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {profile?.is_super_admin && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between font-bold text-foreground">
                <span>📊 Subsidiary View</span>
                <SubsidiarySelector compact />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 border border-primary/30">
                <p className="text-sm font-semibold text-foreground">
                  {allSubsidiariesView 
                    ? '🌐 Currently viewing: All Subsidiaries (Consolidated View)' 
                    : currentSubsidiary 
                      ? `🏢 Currently viewing: ${currentSubsidiary.subsidiary_name}` 
                      : '🌐 Select a subsidiary to view specific data'
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  Data scope: {allSubsidiariesView ? 'All accessible subsidiaries' : currentSubsidiary ? 'Single subsidiary' : 'No selection'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* KPI Cards Grid - 2 columns on mobile */}
      <div className="grid grid-cols-2 gap-3">
        {kpiData.map((kpi, index) => (
          <div key={index} onClick={kpi.onClick} className="cursor-pointer">
            <MobileKPICard
              title={kpi.title}
              value={kpi.value}
              subValue={kpi.subValue}
              icon={kpi.icon}
              trend={kpi.trend}
              variant={kpi.variant}
              className="hover:shadow-lg transition-all duration-200 active:scale-95"
            />
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-card-foreground">⚡ Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => {
              const colorMap = {
                'add-vehicle': 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-green-400 text-white shadow-lg hover:shadow-xl',
                'add-fuel': 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-blue-400 text-white shadow-lg hover:shadow-xl',
                'add-maintenance': 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-orange-400 text-white shadow-lg hover:shadow-xl',
                'add-driver': 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 border-purple-400 text-white shadow-lg hover:shadow-xl'
              };
              
              return (
                <Button
                  key={index}
                  className={`h-16 flex-col gap-2 touch-target transition-all duration-200 hover:scale-105 hover:-translate-y-1 border-2 font-semibold ${colorMap[action.action] || colorMap['add-vehicle']}`}
                  onClick={() => handleQuickAction(action.action)}
                >
                  <action.icon className="h-6 w-6 drop-shadow-sm" />
                  <span className="text-xs font-bold drop-shadow-sm">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Charts */}
      <MobileChartCarousel
        charts={[
          {
            id: 'fuel-consumption',
            title: 'Fuel Consumption Trends',
            type: 'line',
            data: [
              { date: 'Week 1', diesel: 120, petrol: 80, cng: 40 },
              { date: 'Week 2', diesel: 150, petrol: 90, cng: 50 },
              { date: 'Week 3', diesel: 130, petrol: 85, cng: 45 },
              { date: 'Week 4', diesel: 170, petrol: 95, cng: 55 },
              { date: 'Week 5', diesel: 140, petrol: 88, cng: 48 }
            ],
            dataKeys: {
              x: 'date',
              y: ['diesel', 'petrol', 'cng'],
              colors: ['#3B82F6', '#10B981', '#F59E0B']
            }
          },
          {
            id: 'cost-analysis',
            title: 'Monthly Cost Analysis',
            type: 'bar',
            data: [
              { month: 'January', fuel: 45000, maintenance: 12000, other: 5000 },
              { month: 'February', fuel: 52000, maintenance: 8000, other: 6000 },
              { month: 'March', fuel: 48000, maintenance: 15000, other: 4500 },
              { month: 'April', fuel: 55000, maintenance: 10000, other: 7000 }
            ],
            dataKeys: {
              x: 'month',
              y: ['fuel', 'maintenance', 'other'],
              colors: ['#3B82F6', '#F97316', '#8B5CF6']
            }
          },
          {
            id: 'vehicle-status',
            title: 'Vehicle Status Distribution',
            type: 'pie',
            data: [
              { name: 'Active', value: 24 },
              { name: 'Under Maintenance', value: 2 },
              { name: 'Inactive', value: 1 }
            ],
            dataKeys: {
              x: 'name',
              y: 'value',
              colors: ['#10B981', '#F59E0B', '#EF4444']
            }
          }
        ]}
      />

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-card-foreground">📋 Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {dashboardData.recentActivity.length > 0 ? 
              dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-background to-muted/30 rounded-lg border hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full shadow-sm ${
                      activity.type === 'fuel' ? 'bg-blue-500 shadow-blue-500/30' :
                      activity.type === 'maintenance' ? 'bg-orange-500 shadow-orange-500/30' : 'bg-green-500 shadow-green-500/30'
                    }`} />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{activity.title}</p>
                      <p className="text-xs font-medium text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'fuel' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' :
                    activity.type === 'maintenance' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-300' : 
                    'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300'
                  }`}>
                    {activity.type === 'fuel' ? '⛽' : activity.type === 'maintenance' ? '🔧' : '👤'}
                  </div>
                </div>
              )) : 
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">No recent activity</p>
                  <p className="text-xs">Start by adding vehicles or fuel logs</p>
                </div>
              </div>
            }
          </div>
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <MobileFAB
        onClick={() => handleQuickAction('quick-add')}
        variant="primary"
        label="Quick Add"
      />
    </div>
  );
}
