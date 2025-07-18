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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.full_name || 'User'}! Here's your fleet overview.
          </p>
        </div>
        
        {/* Period Selector */}
        <Tabs value={period} onValueChange={(value) => setPeriod(value as any)}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="quarter">Quarter</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="enhanced-card border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
              Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${getAlertSeverityColor(alert.severity)}`} />
                    <div>
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const TrendIcon = card.trendUp ? TrendingUp : TrendingDown;
          
          return (
            <Card key={index} className="enhanced-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold">{card.value}</p>
                    <div className="flex items-center space-x-1">
                      <TrendIcon className={`h-3 w-3 ${card.trendUp ? 'text-green-500' : 'text-red-500'}`} />
                      <span className={`text-xs ${card.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                        {card.trend}
                      </span>
                      <span className="text-xs text-muted-foreground">vs last {period}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
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

      {/* Quick Actions */}
      <Card className="enhanced-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Fuel className="h-5 w-5" />
              <span>Add Fuel Log</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Car className="h-5 w-5" />
              <span>Add Vehicle</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Route className="h-5 w-5" />
              <span>Update Odometer</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Calendar className="h-5 w-5" />
              <span>Schedule Maintenance</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}