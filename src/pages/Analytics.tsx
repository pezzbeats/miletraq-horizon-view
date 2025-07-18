import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AnalyticsKPIs } from "@/components/analytics/AnalyticsKPIs";
import { AnalyticsFilters } from "@/components/analytics/AnalyticsFilters";
import { FuelEfficiencyChart } from "@/components/analytics/FuelEfficiencyChart";
import { CostAnalysisChart } from "@/components/analytics/CostAnalysisChart";
import { VehicleUtilizationChart } from "@/components/analytics/VehicleUtilizationChart";
import { DriverPerformanceChart } from "@/components/analytics/DriverPerformanceChart";
import { MaintenanceAnalysisChart } from "@/components/analytics/MaintenanceAnalysisChart";
import { BudgetPerformanceChart } from "@/components/analytics/BudgetPerformanceChart";
import { QuickInsightsPanel } from "@/components/analytics/QuickInsightsPanel";

interface AnalyticsData {
  fuelLogs: any[];
  maintenanceLogs: any[];
  budgets: any[];
  vehicles: any[];
  drivers: any[];
  odometer: any[];
}

interface FilterState {
  dateRange: {
    from: Date;
    to: Date;
  };
  vehicles: string[];
  drivers: string[];
  categories: string[];
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData>({
    fuelLogs: [],
    maintenanceLogs: [],
    budgets: [],
    vehicles: [],
    drivers: [],
    odometer: [],
  });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      to: new Date(),
    },
    vehicles: [],
    drivers: [],
    categories: ['fuel', 'maintenance', 'parts', 'labour'],
  });

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const { from, to } = filters.dateRange;
      const dateFrom = from.toISOString().split('T')[0];
      const dateTo = to.toISOString().split('T')[0];

      // Fetch all required data in parallel
      const [
        fuelLogsRes,
        maintenanceLogsRes,
        budgetsRes,
        vehiclesRes,
        driversRes,
        odometerRes,
      ] = await Promise.all([
        // Fuel logs with related data
        supabase
          .from('fuel_log')
          .select(`
            *,
            vehicles (id, vehicle_number, make, model),
            drivers (id, name)
          `)
          .gte('date', dateFrom)
          .lte('date', dateTo)
          .order('date', { ascending: false }),

        // Maintenance logs with related data
        supabase
          .from('maintenance_log')
          .select(`
            *,
            vehicles (id, vehicle_number, make, model),
            maintenance_parts_used (
              id,
              part_id,
              quantity,
              unit_cost,
              total_cost,
              parts_master (name)
            )
          `)
          .gte('maintenance_date', dateFrom)
          .lte('maintenance_date', dateTo)
          .order('maintenance_date', { ascending: false }),

        // Budget data
        supabase
          .from('budget')
          .select('*')
          .order('period_start', { ascending: false }),

        // Vehicles
        supabase
          .from('vehicles')
          .select('*')
          .eq('status', 'active')
          .order('vehicle_number'),

        // Drivers
        supabase
          .from('drivers')
          .select('*')
          .eq('is_active', true)
          .order('name'),

        // Odometer readings
        supabase
          .from('odometer_readings')
          .select(`
            *,
            vehicles (id, vehicle_number, make, model)
          `)
          .gte('reading_date', dateFrom)
          .lte('reading_date', dateTo)
          .order('reading_date', { ascending: false }),
      ]);

      // Check for errors
      if (fuelLogsRes.error) throw fuelLogsRes.error;
      if (maintenanceLogsRes.error) throw maintenanceLogsRes.error;
      if (budgetsRes.error) throw budgetsRes.error;
      if (vehiclesRes.error) throw vehiclesRes.error;
      if (driversRes.error) throw driversRes.error;
      if (odometerRes.error) throw odometerRes.error;

      setData({
        fuelLogs: fuelLogsRes.data || [],
        maintenanceLogs: maintenanceLogsRes.data || [],
        budgets: budgetsRes.data || [],
        vehicles: vehiclesRes.data || [],
        drivers: driversRes.data || [],
        odometer: odometerRes.data || [],
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [filters.dateRange]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleExportData = (format: 'csv' | 'pdf' | 'excel') => {
    // Implementation for data export
    toast({
      title: "Export Started",
      description: `Exporting analytics data as ${format.toUpperCase()}...`,
    });
    // TODO: Implement actual export functionality
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
    toast({
      title: "Data Refreshed",
      description: "Analytics data has been updated with the latest information",
    });
  };

  const filteredData = {
    ...data,
    fuelLogs: data.fuelLogs.filter(log => 
      (filters.vehicles.length === 0 || filters.vehicles.includes(log.vehicle_id)) &&
      (filters.drivers.length === 0 || !log.driver_id || filters.drivers.includes(log.driver_id))
    ),
    maintenanceLogs: data.maintenanceLogs.filter(log => 
      filters.vehicles.length === 0 || filters.vehicles.includes(log.vehicle_id)
    ),
    odometer: data.odometer.filter(reading => 
      filters.vehicles.length === 0 || filters.vehicles.includes(reading.vehicle_id)
    ),
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive performance insights and data analysis
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportData('csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {filtersOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Filter Analytics Data</CardTitle>
            <CardDescription>
              Customize the date range and data scope for your analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsFilters
              filters={filters}
              vehicles={data.vehicles}
              drivers={data.drivers}
              onFilterChange={handleFilterChange}
            />
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <AnalyticsKPIs data={filteredData} loading={loading} />

      {/* Quick Insights */}
      <QuickInsightsPanel data={filteredData} loading={loading} />

      {/* Charts Section */}
      <Tabs defaultValue="fuel-efficiency" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="fuel-efficiency">Fuel Efficiency</TabsTrigger>
          <TabsTrigger value="cost-analysis">Cost Analysis</TabsTrigger>
          <TabsTrigger value="utilization">Utilization</TabsTrigger>
          <TabsTrigger value="driver-performance">Driver Performance</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
        </TabsList>

        <TabsContent value="fuel-efficiency">
          <FuelEfficiencyChart data={filteredData} loading={loading} />
        </TabsContent>

        <TabsContent value="cost-analysis">
          <CostAnalysisChart data={filteredData} loading={loading} />
        </TabsContent>

        <TabsContent value="utilization">
          <VehicleUtilizationChart data={filteredData} loading={loading} />
        </TabsContent>

        <TabsContent value="driver-performance">
          <DriverPerformanceChart data={filteredData} loading={loading} />
        </TabsContent>

        <TabsContent value="maintenance">
          <MaintenanceAnalysisChart data={filteredData} loading={loading} />
        </TabsContent>

        <TabsContent value="budget">
          <BudgetPerformanceChart data={filteredData} loading={loading} />
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {!loading && 
       filteredData.fuelLogs.length === 0 && 
       filteredData.maintenanceLogs.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-muted-foreground">
              <div className="text-lg font-medium mb-2">No data available for analysis</div>
              <div>Add fuel logs and maintenance records to see comprehensive analytics</div>
              <div className="mt-4 text-sm">
                <p>Start by recording:</p>
                <ul className="list-disc list-inside mt-2">
                  <li>Fuel entries and refueling data</li>
                  <li>Maintenance activities and costs</li>
                  <li>Odometer readings for utilization tracking</li>
                  <li>Budget allocations for cost analysis</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}