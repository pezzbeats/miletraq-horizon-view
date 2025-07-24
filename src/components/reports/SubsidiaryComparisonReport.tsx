import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Fuel, 
  Wrench, 
  DollarSign,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { supabase } from '@/integrations/supabase/client';
import { useSubsidiary } from '@/contexts/SubsidiaryContext';
import { toast } from '@/hooks/use-toast';

interface SubsidiaryMetrics {
  id: string;
  name: string;
  code: string;
  totalVehicles: number;
  activeVehicles: number;
  totalDrivers: number;
  fuelCosts: number;
  maintenanceCosts: number;
  totalCosts: number;
  fuelEfficiency: number;
  maintenanceFrequency: number;
  utilizationRate: number;
  costPerVehicle: number;
  costPerKm: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

export function SubsidiaryComparisonReport() {
  const { subsidiaries } = useSubsidiary();
  const [metrics, setMetrics] = useState<SubsidiaryMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1),
    to: new Date()
  });
  const [comparisonType, setComparisonType] = useState<'costs' | 'efficiency' | 'utilization'>('costs');

  useEffect(() => {
    fetchMetrics();
  }, [dateRange, subsidiaries]);

  const fetchMetrics = async () => {
    if (subsidiaries.length === 0) return;

    setLoading(true);
    try {
      const metricsData: SubsidiaryMetrics[] = [];

      for (const subsidiary of subsidiaries) {
        // Fetch vehicle data
        const { data: vehicles, error: vehicleError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('subsidiary_id', subsidiary.id);

        if (vehicleError) throw vehicleError;

        // Fetch driver data
        const { data: drivers, error: driverError } = await supabase
          .from('drivers')
          .select('*')
          .eq('subsidiary_id', subsidiary.id);

        if (driverError) throw driverError;

        // Fetch fuel costs
        const { data: fuelLogs, error: fuelError } = await supabase
          .from('fuel_log')
          .select('total_cost, fuel_volume, date')
          .eq('subsidiary_id', subsidiary.id)
          .gte('date', dateRange.from.toISOString().split('T')[0])
          .lte('date', dateRange.to.toISOString().split('T')[0]);

        if (fuelError) throw fuelError;

        // Fetch maintenance costs
        const { data: maintenanceLogs, error: maintenanceError } = await supabase
          .from('maintenance_log')
          .select('total_cost, maintenance_date')
          .eq('subsidiary_id', subsidiary.id)
          .gte('maintenance_date', dateRange.from.toISOString().split('T')[0])
          .lte('maintenance_date', dateRange.to.toISOString().split('T')[0]);

        if (maintenanceError) throw maintenanceError;

        // Calculate metrics
        const totalVehicles = vehicles?.length || 0;
        const activeVehicles = vehicles?.filter(v => v.status === 'active').length || 0;
        const totalDrivers = drivers?.length || 0;
        
        const fuelCosts = fuelLogs?.reduce((sum, log) => sum + (log.total_cost || 0), 0) || 0;
        const totalFuelVolume = fuelLogs?.reduce((sum, log) => sum + (log.fuel_volume || 0), 0) || 0;
        const maintenanceCosts = maintenanceLogs?.reduce((sum, log) => sum + (log.total_cost || 0), 0) || 0;
        const totalCosts = fuelCosts + maintenanceCosts;

        const fuelEfficiency = totalFuelVolume > 0 ? totalFuelVolume / totalVehicles : 0;
        const maintenanceFrequency = maintenanceLogs?.length || 0;
        const utilizationRate = activeVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0;
        const costPerVehicle = totalVehicles > 0 ? totalCosts / totalVehicles : 0;
        const costPerKm = 0; // Would need odometer data for accurate calculation

        // Simple trend calculation (mock data for demo)
        const trendPercentage = Math.random() * 20 - 10; // -10% to +10%
        const trend: 'up' | 'down' | 'stable' = 
          trendPercentage > 2 ? 'up' : 
          trendPercentage < -2 ? 'down' : 'stable';

        metricsData.push({
          id: subsidiary.id,
          name: subsidiary.subsidiary_name,
          code: subsidiary.subsidiary_code,
          totalVehicles,
          activeVehicles,
          totalDrivers,
          fuelCosts,
          maintenanceCosts,
          totalCosts,
          fuelEfficiency,
          maintenanceFrequency,
          utilizationRate,
          costPerVehicle,
          costPerKm,
          trend,
          trendPercentage
        });
      }

      setMetrics(metricsData);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch subsidiary metrics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const csvContent = [
      ['Subsidiary', 'Code', 'Total Vehicles', 'Active Vehicles', 'Total Drivers', 
       'Fuel Costs', 'Maintenance Costs', 'Total Costs', 'Utilization Rate', 'Trend'],
      ...metrics.map(m => [
        m.name, m.code, m.totalVehicles, m.activeVehicles, m.totalDrivers,
        m.fuelCosts.toFixed(2), m.maintenanceCosts.toFixed(2), m.totalCosts.toFixed(2),
        m.utilizationRate.toFixed(1) + '%', m.trend
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subsidiary_comparison_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getChartData = () => {
    switch (comparisonType) {
      case 'costs':
        return metrics.map(m => ({
          name: m.code,
          fuelCosts: m.fuelCosts,
          maintenanceCosts: m.maintenanceCosts,
          totalCosts: m.totalCosts
        }));
      case 'efficiency':
        return metrics.map(m => ({
          name: m.code,
          fuelEfficiency: m.fuelEfficiency,
          utilizationRate: m.utilizationRate
        }));
      case 'utilization':
        return metrics.map(m => ({
          name: m.code,
          activeVehicles: m.activeVehicles,
          totalVehicles: m.totalVehicles,
          utilizationRate: m.utilizationRate
        }));
      default:
        return [];
    }
  };

  const getPieChartData = () => {
    return metrics.map(m => ({
      name: m.code,
      value: m.totalCosts,
      fullName: m.name
    }));
  };

  const getTotalMetrics = () => {
    return metrics.reduce((totals, m) => ({
      totalVehicles: totals.totalVehicles + m.totalVehicles,
      totalDrivers: totals.totalDrivers + m.totalDrivers,
      totalCosts: totals.totalCosts + m.totalCosts,
      avgUtilization: totals.avgUtilization + m.utilizationRate / metrics.length
    }), {
      totalVehicles: 0,
      totalDrivers: 0,
      totalCosts: 0,
      avgUtilization: 0
    });
  };

  const totals = getTotalMetrics();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Subsidiary Comparison Report</h2>
          <p className="text-muted-foreground">
            Comprehensive performance analysis across all subsidiaries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <DatePickerWithRange
              date={{ from: dateRange.from, to: dateRange.to }}
              onDateChange={(range) => {
                if (range?.from && range?.to) {
                  setDateRange({ from: range.from, to: range.to });
                }
              }}
              className="w-full sm:w-auto"
            />
            <Select value={comparisonType} onValueChange={(value: "costs" | "efficiency" | "utilization") => setComparisonType(value)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Comparison Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="costs">Cost Analysis</SelectItem>
                <SelectItem value="efficiency">Efficiency Metrics</SelectItem>
                <SelectItem value="utilization">Utilization Rates</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{metrics.length}</p>
                <p className="text-sm text-muted-foreground">Subsidiaries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Fuel className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{totals.totalVehicles}</p>
                <p className="text-sm text-muted-foreground">Total Vehicles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">₹{totals.totalCosts.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Costs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{totals.avgUtilization.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Avg Utilization</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {comparisonType === 'costs' && 'Cost Comparison'}
              {comparisonType === 'efficiency' && 'Efficiency Metrics'}
              {comparisonType === 'utilization' && 'Vehicle Utilization'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {comparisonType === 'costs' ? (
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                  />
                  <Bar dataKey="fuelCosts" name="Fuel Costs" fill="#8884d8" />
                  <Bar dataKey="maintenanceCosts" name="Maintenance Costs" fill="#82ca9d" />
                </BarChart>
              ) : (
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  {comparisonType === 'efficiency' && (
                    <>
                      <Line 
                        type="monotone" 
                        dataKey="fuelEfficiency" 
                        name="Fuel Efficiency" 
                        stroke="#8884d8" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="utilizationRate" 
                        name="Utilization Rate" 
                        stroke="#82ca9d" 
                      />
                    </>
                  )}
                  {comparisonType === 'utilization' && (
                    <Line 
                      type="monotone" 
                      dataKey="utilizationRate" 
                      name="Utilization Rate" 
                      stroke="#8884d8" 
                    />
                  )}
                </LineChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getPieChartData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getPieChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Rankings */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics
                .sort((a, b) => b.utilizationRate - a.utilizationRate)
                .map((metric, index) => (
                  <div key={metric.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{metric.name}</p>
                        <p className="text-sm text-muted-foreground">{metric.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{metric.utilizationRate.toFixed(1)}%</span>
                        {metric.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {metric.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                      </div>
                      <Badge variant={metric.trend === 'up' ? 'default' : metric.trend === 'down' ? 'destructive' : 'secondary'} className="text-xs">
                        {metric.trendPercentage > 0 ? '+' : ''}{metric.trendPercentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Subsidiary</th>
                  <th className="text-right p-2">Vehicles</th>
                  <th className="text-right p-2">Drivers</th>
                  <th className="text-right p-2">Fuel Costs</th>
                  <th className="text-right p-2">Maintenance</th>
                  <th className="text-right p-2">Total Costs</th>
                  <th className="text-right p-2">Utilization</th>
                  <th className="text-right p-2">Trend</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric) => (
                  <tr key={metric.id} className="border-b">
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{metric.name}</p>
                        <p className="text-sm text-muted-foreground">{metric.code}</p>
                      </div>
                    </td>
                    <td className="text-right p-2">
                      {metric.activeVehicles}/{metric.totalVehicles}
                    </td>
                    <td className="text-right p-2">{metric.totalDrivers}</td>
                    <td className="text-right p-2">₹{metric.fuelCosts.toLocaleString()}</td>
                    <td className="text-right p-2">₹{metric.maintenanceCosts.toLocaleString()}</td>
                    <td className="text-right p-2 font-medium">₹{metric.totalCosts.toLocaleString()}</td>
                    <td className="text-right p-2">{metric.utilizationRate.toFixed(1)}%</td>
                    <td className="text-right p-2">
                      <div className="flex items-center justify-end gap-1">
                        {metric.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {metric.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                        <span className={`text-sm ${
                          metric.trend === 'up' ? 'text-green-600' : 
                          metric.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
                        }`}>
                          {metric.trendPercentage > 0 ? '+' : ''}{metric.trendPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}