
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubsidiary } from '@/contexts/SubsidiaryContext';
import { MobileKPICard } from '@/components/ui/mobile-card';
import { MobileFAB } from '@/components/ui/mobile-fab';
import { MobileChartCarousel } from '@/components/ui/mobile-chart';
import { SubsidiarySelector } from '@/components/subsidiary/SubsidiarySelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  const { currentSubsidiary } = useSubsidiary();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleQuickAction = (action: string) => {
    console.log('Quick action:', action);
    // Navigate to appropriate page or open modal
  };

  // Mock data - in real implementation, fetch from API
  const kpiData = [
    {
      title: 'Active Vehicles',
      value: '24',
      subValue: 'of 26 total',
      icon: Car,
      trend: { value: '2.3%', isPositive: true },
      variant: 'primary' as const
    },
    {
      title: 'Fuel Cost',
      value: '₹45.2K',
      subValue: 'this month',
      icon: Fuel,
      trend: { value: '8.1%', isPositive: false },
      variant: 'warning' as const
    },
    {
      title: 'Maintenance',
      value: '6',
      subValue: 'pending tasks',
      icon: Wrench,
      trend: { value: '2', isPositive: false },
      variant: 'destructive' as const
    },
    {
      title: 'Drivers',
      value: '18',
      subValue: 'active drivers',
      icon: Users,
      variant: 'success' as const
    },
    {
      title: 'Total Expenses',
      value: '₹1.2L',
      subValue: 'this month',
      icon: DollarSign,
      trend: { value: '12.5%', isPositive: true },
      variant: 'default' as const
    },
    {
      title: 'Alerts',
      value: '3',
      subValue: 'require attention',
      icon: AlertTriangle,
      variant: 'warning' as const
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
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
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
                  {currentSubsidiary 
                    ? `🏢 Currently viewing: ${currentSubsidiary.subsidiary_name}` 
                    : '🌐 Select a subsidiary to view specific data'
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  Data scope: {currentSubsidiary ? 'Single subsidiary' : 'All subsidiaries'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* KPI Cards Grid - 2 columns on mobile */}
      <div className="grid grid-cols-2 gap-3">
        {kpiData.map((kpi, index) => (
          <MobileKPICard
            key={index}
            title={kpi.title}
            value={kpi.value}
            subValue={kpi.subValue}
            icon={kpi.icon}
            trend={kpi.trend}
            variant={kpi.variant}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
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
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {[
              { title: 'Vehicle S-1 refueled', time: '2 hours ago', type: 'fuel' },
              { title: 'Maintenance scheduled for UK18PA0049', time: '4 hours ago', type: 'maintenance' },
              { title: 'New driver added: John Doe', time: '1 day ago', type: 'driver' }
            ].map((activity, index) => (
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
            ))}
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
