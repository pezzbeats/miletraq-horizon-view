import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { format, parseISO, startOfMonth } from "date-fns";

interface AnalyticsData {
  fuelLogs: any[];
  maintenanceLogs: any[];
  vehicles: any[];
}

interface CostAnalysisChartProps {
  data: AnalyticsData;
  loading: boolean;
}

export const CostAnalysisChart = ({ data, loading }: CostAnalysisChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cost Analysis</CardTitle>
          <CardDescription>Comprehensive cost breakdown and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  // Process monthly cost data
  const monthlyCostData = () => {
    const monthlyData: Record<string, { fuel: number; maintenance: number; parts: number; labour: number }> = {};

    // Process fuel costs by fuel type
    data.fuelLogs.forEach(log => {
      const month = format(startOfMonth(parseISO(log.date)), 'MMM yyyy');
      if (!monthlyData[month]) {
        monthlyData[month] = { fuel: 0, maintenance: 0, parts: 0, labour: 0 };
      }
      monthlyData[month].fuel += log.total_cost || 0;
    });

    // Process maintenance costs
    data.maintenanceLogs.forEach(log => {
      const month = format(startOfMonth(parseISO(log.maintenance_date)), 'MMM yyyy');
      if (!monthlyData[month]) {
        monthlyData[month] = { fuel: 0, maintenance: 0, parts: 0, labour: 0 };
      }
      monthlyData[month].maintenance += log.labor_cost || 0;
      
      // Add parts costs
      if (log.maintenance_parts_used) {
        log.maintenance_parts_used.forEach((part: any) => {
          monthlyData[month].parts += part.total_cost || 0;
        });
      }
    });

    return Object.entries(monthlyData)
      .map(([month, costs]) => ({
        month,
        ...costs,
        total: costs.fuel + costs.maintenance + costs.parts + costs.labour
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  };

  // Process cost breakdown pie chart data (including fuel types)
  const costBreakdownData = () => {
    const fuelCosts = data.fuelLogs.reduce((acc, log) => {
      const fuelType = log.fuel_type || 'diesel';
      acc[fuelType] = (acc[fuelType] || 0) + (log.total_cost || 0);
      return acc;
    }, {} as Record<string, number>);

    const totalMaintenance = data.maintenanceLogs.reduce((sum, log) => sum + (log.labor_cost || 0), 0);
    const totalParts = data.maintenanceLogs.reduce((sum, log) => {
      return sum + (log.maintenance_parts_used?.reduce((partSum: number, part: any) => 
        partSum + (part.total_cost || 0), 0) || 0);
    }, 0);

    const breakdown = [
      ...Object.entries(fuelCosts).map(([fuelType, cost], index) => ({
        name: `${fuelType.charAt(0).toUpperCase() + fuelType.slice(1)} Fuel`,
        value: cost,
        color: ['#8884d8', '#82ca9d', '#ffc658'][index % 3]
      })),
      { name: 'Maintenance', value: totalMaintenance, color: '#ff7300' },
      { name: 'Parts', value: totalParts, color: '#8dd1e1' },
    ].filter(item => item.value > 0);

    return breakdown;
  };

  // Process vehicle cost data
  const vehicleCostData = () => {
    return data.vehicles.map(vehicle => {
      const fuelCost = data.fuelLogs
        .filter(log => log.vehicle_id === vehicle.id)
        .reduce((sum, log) => sum + (log.total_cost || 0), 0);
      
      const maintenanceCost = data.maintenanceLogs
        .filter(log => log.vehicle_id === vehicle.id)
        .reduce((sum, log) => sum + (log.total_cost || 0), 0);

      return {
        vehicle: vehicle.vehicle_number,
        fuel: fuelCost,
        maintenance: maintenanceCost,
        total: fuelCost + maintenanceCost
      };
    }).sort((a, b) => b.total - a.total);
  };

  const monthlyData = monthlyCostData();
  const breakdownData = costBreakdownData();
  const vehicleData = vehicleCostData();

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Analysis</CardTitle>
        <CardDescription>
          Multi-fuel cost breakdown and spending trends across categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="monthly" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
            <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
            <TabsTrigger value="vehicle">By Vehicle</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={monthlyData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis 
                    label={{ value: 'Cost (₹)', angle: -90, position: 'insideLeft' }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Cost']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="fuel" stackId="a" fill="#8884d8" name="Fuel" />
                  <Bar dataKey="maintenance" stackId="a" fill="#82ca9d" name="Maintenance" />
                  <Bar dataKey="parts" stackId="a" fill="#ffc658" name="Parts" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg font-medium">No cost data available</p>
                  <p className="text-sm">Record expenses to see monthly trends</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="breakdown">
            {breakdownData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={breakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {breakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg font-medium">No cost breakdown available</p>
                  <p className="text-sm">Record different types of expenses to see breakdown</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="vehicle">
            {vehicleData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={vehicleData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="vehicle" />
                  <YAxis 
                    label={{ value: 'Cost (₹)', angle: -90, position: 'insideLeft' }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Cost']}
                    labelFormatter={(label) => `Vehicle: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="fuel" stackId="a" fill="#8884d8" name="Fuel" />
                  <Bar dataKey="maintenance" stackId="a" fill="#82ca9d" name="Maintenance" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg font-medium">No vehicle cost data available</p>
                  <p className="text-sm">Record vehicle-specific expenses to see breakdown</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};