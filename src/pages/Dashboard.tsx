import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Car, 
  Fuel, 
  Route, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Calendar,
  Clock,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalFuelIssued: number;
  avgMileage: number;
  totalKm: number;
  fuelCostPerKm: number;
  vehicleCount: number;
  activeDrivers: number;
}

interface Alert {
  id: string;
  type: 'expiry' | 'mileage' | 'tank';
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  date: string;
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalFuelIssued: 0,
    avgMileage: 0,
    totalKm: 0,
    fuelCostPerKm: 0,
    vehicleCount: 0,
    activeDrivers: 0,
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [period]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load basic counts
      const [vehiclesResult, driversResult, fuelLogResult] = await Promise.all([
        supabase.from('vehicles').select('id', { count: 'exact' }),
        supabase.from('drivers').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('fuel_log').select('fuel_volume, total_cost, km_driven'),
      ]);

      const vehicleCount = vehiclesResult.count || 0;
      const activeDrivers = driversResult.count || 0;
      
      // Calculate fuel stats
      const fuelData = fuelLogResult.data || [];
      const totalFuelIssued = fuelData.reduce((sum, log) => sum + (log.fuel_volume || 0), 0);
      const totalCost = fuelData.reduce((sum, log) => sum + (log.total_cost || 0), 0);
      const totalKm = fuelData.reduce((sum, log) => sum + (log.km_driven || 0), 0);
      
      const avgMileage = totalFuelIssued > 0 ? totalKm / totalFuelIssued : 0;
      const fuelCostPerKm = totalKm > 0 ? totalCost / totalKm : 0;

      setStats({
        totalFuelIssued,
        avgMileage,
        totalKm,
        fuelCostPerKm,
        vehicleCount,
        activeDrivers,
      });

      // Generate sample alerts (replace with real data)
      setAlerts([
        {
          id: '1',
          type: 'expiry',
          title: 'Document Expiry',
          message: '3 vehicle documents expiring in the next 7 days',
          severity: 'high',
          date: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'mileage',
          title: 'Mileage Drop',
          message: 'Vehicle KA-01-AB-1234 showing 25% mileage drop',
          severity: 'medium',
          date: new Date().toISOString(),
        },
        {
          id: '3',
          type: 'tank',
          title: 'Low Fuel Tank',
          message: 'Diesel tank level below 20%',
          severity: 'medium',
          date: new Date().toISOString(),
        },
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Fuel Issued',
      value: `${stats.totalFuelIssued.toFixed(1)}L`,
      icon: Fuel,
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Average Mileage',
      value: `${stats.avgMileage.toFixed(1)} km/L`,
      icon: Route,
      trend: '-2%',
      trendUp: false,
    },
    {
      title: 'Total Distance',
      value: `${stats.totalKm.toLocaleString()} km`,
      icon: Car,
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Cost per KM',
      value: `₹${stats.fuelCostPerKm.toFixed(2)}`,
      icon: DollarSign,
      trend: '+5%',
      trendUp: false,
    },
  ];

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-destructive';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl p-8 mb-8">
        <div className="absolute inset-0 gradient-header opacity-90"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="relative z-10 flex items-center justify-between text-white">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-white/90 text-lg">
              Welcome back, {profile?.full_name || 'User'}! Here's your fleet overview.
            </p>
          </div>
          
          {/* Period Selector */}
          <Tabs value={period} onValueChange={(value) => setPeriod(value as any)}>
            <TabsList className="bg-white/20 backdrop-blur border-white/30">
              <TabsTrigger value="week" className="text-white data-[state=active]:bg-white/30">Week</TabsTrigger>
              <TabsTrigger value="month" className="text-white data-[state=active]:bg-white/30">Month</TabsTrigger>
              <TabsTrigger value="quarter" className="text-white data-[state=active]:bg-white/30">Quarter</TabsTrigger>
              <TabsTrigger value="year" className="text-white data-[state=active]:bg-white/30">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Enhanced Alerts with Gradient */}
      {alerts.length > 0 && (
        <Card className="card-warning hover-lift">
          <CardHeader className="gradient-warning text-white rounded-t-lg">
            <CardTitle className="flex items-center text-white">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 rounded-xl glass-card hover-lift">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      alert.severity === 'high' ? 'gradient-error' :
                      alert.severity === 'medium' ? 'gradient-warning' : 'gradient-info'
                    }`} />
                    <div>
                      <p className="font-semibold text-foreground">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`capitalize font-medium ${
                    alert.severity === 'high' ? 'border-red-300 text-red-700 bg-red-50' :
                    alert.severity === 'medium' ? 'border-orange-300 text-orange-700 bg-orange-50' :
                    'border-blue-300 text-blue-700 bg-blue-50'
                  }`}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Stats Cards with Gradients */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const TrendIcon = card.trendUp ? TrendingUp : TrendingDown;
          const gradientClass = index === 0 ? 'card-info' : index === 1 ? 'card-success' : index === 2 ? 'card-purple' : 'card-warning';
          
          return (
            <Card key={index} className={`${gradientClass} hover-lift hover-glow`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="text-3xl font-bold gradient-text">{card.value}</p>
                    <div className="flex items-center space-x-1">
                      <TrendIcon className={`h-4 w-4 ${card.trendUp ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={`text-sm font-medium ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                        {card.trend}
                      </span>
                      <span className="text-sm text-muted-foreground">vs last {period}</span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center shadow-colored">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -inset-1 gradient-primary rounded-xl blur opacity-20"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="enhanced-card">
          <CardHeader>
            <CardTitle>Fuel Consumption Trend</CardTitle>
            <CardDescription>Daily fuel consumption over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Chart will be implemented with Recharts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="enhanced-card">
          <CardHeader>
            <CardTitle>Cost Analysis</CardTitle>
            <CardDescription>Fuel cost trends and budget utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Chart will be implemented with Recharts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-info hover-lift">
          <CardHeader className="gradient-info text-white rounded-t-lg">
            <CardTitle className="text-white">Fuel Consumption Trend</CardTitle>
            <CardDescription className="text-white/90">Daily fuel consumption over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="w-16 h-16 rounded-xl gradient-info flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <p className="text-lg font-medium">Chart Analytics</p>
                <p className="text-sm">Interactive charts coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-success hover-lift">
          <CardHeader className="gradient-success text-white rounded-t-lg">
            <CardTitle className="text-white">Cost Analysis</CardTitle>
            <CardDescription className="text-white/90">Fuel cost trends and budget utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="w-16 h-16 rounded-xl gradient-success flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <p className="text-lg font-medium">Cost Insights</p>
                <p className="text-sm">Advanced analytics coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Actions */}
      <Card className="card-purple hover-lift">
        <CardHeader className="gradient-purple text-white rounded-t-lg">
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription className="text-white/90">Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="btn-gradient h-24 flex-col space-y-3 group">
              <Fuel className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Add Fuel Log</span>
            </Button>
            <Button className="h-24 flex-col space-y-3 group gradient-success text-white hover:scale-105 transition-all">
              <Car className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Add Vehicle</span>
            </Button>
            <Button className="h-24 flex-col space-y-3 group gradient-warning text-white hover:scale-105 transition-all">
              <Route className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Update Odometer</span>
            </Button>
            <Button className="h-24 flex-col space-y-3 group gradient-info text-white hover:scale-105 transition-all">
              <Calendar className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Schedule Maintenance</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}