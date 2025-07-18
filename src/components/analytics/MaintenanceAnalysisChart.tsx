import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { format, parseISO, startOfMonth } from "date-fns";

interface AnalyticsData {
  maintenanceLogs: any[];
  vehicles: any[];
}

interface MaintenanceAnalysisChartProps {
  data: AnalyticsData;
  loading: boolean;
}

export const MaintenanceAnalysisChart = ({ data, loading }: MaintenanceAnalysisChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Analysis</CardTitle>
          <CardDescription>Maintenance frequency, costs, and parts usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  // Maintenance frequency by vehicle
  const maintenanceFrequencyData = () => {
    return data.vehicles.map(vehicle => {
      const vehicleMaintenance = data.maintenanceLogs.filter(log => log.vehicle_id === vehicle.id);
      const totalCost = vehicleMaintenance.reduce((sum, log) => sum + (log.total_cost || 0), 0);
      const frequency = vehicleMaintenance.length;
      const avgCost = frequency > 0 ? totalCost / frequency : 0;

      return {
        vehicle: vehicle.vehicle_number,
        frequency,
        totalCost,
        avgCost: parseFloat(avgCost.toFixed(2)),
        make: vehicle.make,
        model: vehicle.model
      };
    })
    .filter(vehicle => vehicle.frequency > 0)
    .sort((a, b) => b.frequency - a.frequency);
  };

  // Monthly maintenance cost trends
  const monthlyMaintenanceTrends = () => {
    const monthlyData: Record<string, { month: string; cost: number; count: number }> = {};

    data.maintenanceLogs.forEach(log => {
      const month = format(startOfMonth(parseISO(log.maintenance_date)), 'MMM yyyy');
      if (!monthlyData[month]) {
        monthlyData[month] = { month, cost: 0, count: 0 };
      }
      monthlyData[month].cost += log.total_cost || 0;
      monthlyData[month].count += 1;
    });

    return Object.values(monthlyData)
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  };

  // Parts usage distribution
  const partsUsageData = () => {
    const partsUsage: Record<string, { name: string; usage: number; cost: number }> = {};

    data.maintenanceLogs.forEach(log => {
      if (log.maintenance_parts_used) {
        log.maintenance_parts_used.forEach((part: any) => {
          const partName = part.parts_master?.name || 'Unknown Part';
          if (!partsUsage[partName]) {
            partsUsage[partName] = { name: partName, usage: 0, cost: 0 };
          }
          partsUsage[partName].usage += part.quantity || 0;
          partsUsage[partName].cost += part.total_cost || 0;
        });
      }
    });

    return Object.values(partsUsage)
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 8); // Top 8 parts
  };

  const frequencyData = maintenanceFrequencyData();
  const trendsData = monthlyMaintenanceTrends();
  const partsData = partsUsageData();

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Analysis</CardTitle>
        <CardDescription>
          Comprehensive maintenance frequency, costs, and parts usage analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Maintenance Frequency by Vehicle */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Maintenance Frequency by Vehicle</h3>
          {frequencyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={frequencyData}
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
                  yAxisId="frequency"
                  label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="cost"
                  orientation="right"
                  label={{ value: 'Cost (₹)', angle: 90, position: 'insideRight' }}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'frequency' ? `${value} times` : `₹${value.toLocaleString('en-IN')}`,
                    name === 'frequency' ? 'Maintenance Count' : 'Total Cost'
                  ]}
                  labelFormatter={(label) => `Vehicle: ${label}`}
                />
                <Legend />
                <Bar yAxisId="frequency" dataKey="frequency" fill="#8884d8" name="Frequency" />
                <Bar yAxisId="cost" dataKey="totalCost" fill="#82ca9d" name="Total Cost" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium">No maintenance frequency data available</p>
                <p className="text-sm">Record maintenance activities to see frequency analysis</p>
              </div>
            </div>
          )}
        </div>

        {/* Monthly Maintenance Cost Trends */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Monthly Maintenance Cost Trends</h3>
          {trendsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={trendsData}
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
                  yAxisId="cost"
                  label={{ value: 'Cost (₹)', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  yAxisId="count"
                  orientation="right"
                  label={{ value: 'Count', angle: 90, position: 'insideRight' }}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'cost' ? `₹${value.toLocaleString('en-IN')}` : `${value} activities`,
                    name === 'cost' ? 'Total Cost' : 'Maintenance Count'
                  ]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Line 
                  yAxisId="cost"
                  type="monotone" 
                  dataKey="cost" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Cost"
                />
                <Line 
                  yAxisId="count"
                  type="monotone" 
                  dataKey="count" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Count"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium">No maintenance trend data available</p>
                <p className="text-sm">Regular maintenance records will show cost trends</p>
              </div>
            </div>
          )}
        </div>

        {/* Parts Usage Distribution */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Parts Usage Distribution</h3>
          {partsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={partsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => percent > 5 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="cost"
                >
                  {partsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Cost']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium">No parts usage data available</p>
                <p className="text-sm">Record parts usage in maintenance activities to see distribution</p>
              </div>
            </div>
          )}
        </div>

        {/* Maintenance Summary */}
        {frequencyData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {data.maintenanceLogs.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Maintenance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                ₹{data.maintenanceLogs.reduce((sum, log) => sum + (log.total_cost || 0), 0).toLocaleString('en-IN')}
              </div>
              <div className="text-sm text-muted-foreground">Total Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {frequencyData[0]?.vehicle || 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Most Maintained</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                ₹{(data.maintenanceLogs.reduce((sum, log) => sum + (log.total_cost || 0), 0) / Math.max(data.maintenanceLogs.length, 1)).toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Cost per Activity</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};