
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubsidiary } from '@/contexts/SubsidiaryContext';
import { MobileKPICard } from '@/components/ui/mobile-card';
import { MobileFAB } from '@/components/ui/mobile-fab';
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Subsidiary View</span>
                <SubsidiarySelector compact />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                {currentSubsidiary 
                  ? `Viewing data for ${currentSubsidiary.subsidiary_name}` 
                  : 'Select a subsidiary to view specific data'
                }
              </p>
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
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-16 flex-col gap-2 touch-target hover:bg-primary/5 hover:border-primary/20"
                onClick={() => handleQuickAction(action.action)}
              >
                <action.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {[
              { title: 'Vehicle S-1 refueled', time: '2 hours ago', type: 'fuel' },
              { title: 'Maintenance scheduled for UK18PA0049', time: '4 hours ago', type: 'maintenance' },
              { title: 'New driver added: John Doe', time: '1 day ago', type: 'driver' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                <div>
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'fuel' ? 'bg-blue-500' :
                  activity.type === 'maintenance' ? 'bg-orange-500' : 'bg-green-500'
                }`} />
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
