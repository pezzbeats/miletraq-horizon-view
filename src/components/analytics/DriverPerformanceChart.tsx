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
  ScatterChart,
  Scatter
} from "recharts";

interface AnalyticsData {
  fuelLogs: any[];
  drivers: any[];
  vehicles: any[];
}

interface DriverPerformanceChartProps {
  data: AnalyticsData;
  loading: boolean;
}

export const DriverPerformanceChart = ({ data, loading }: DriverPerformanceChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Driver Performance</CardTitle>
          <CardDescription>Fuel efficiency and driving patterns by driver</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  // Calculate driver performance metrics
  const driverPerformanceData = () => {
    return data.drivers.map(driver => {
      const driverLogs = data.fuelLogs.filter(log => log.driver_id === driver.id);
      
      const totalFuelVolume = driverLogs.reduce((sum, log) => sum + (log.fuel_volume || 0), 0);
      const totalDistance = driverLogs.reduce((sum, log) => sum + (log.km_driven || 0), 0);
      const totalCost = driverLogs.reduce((sum, log) => sum + (log.total_cost || 0), 0);
      const tripCount = driverLogs.length;
      
      const averageMileage = totalFuelVolume > 0 ? totalDistance / totalFuelVolume : 0;
      const costPerKm = totalDistance > 0 ? totalCost / totalDistance : 0;
      const averageDistance = tripCount > 0 ? totalDistance / tripCount : 0;

      return {
        driver: driver.name,
        averageMileage: parseFloat(averageMileage.toFixed(2)),
        totalDistance,
        totalFuelVolume: parseFloat(totalFuelVolume.toFixed(2)),
        totalCost,
        tripCount,
        costPerKm: parseFloat(costPerKm.toFixed(2)),
        averageDistance: parseFloat(averageDistance.toFixed(2))
      };
    })
    .filter(driver => driver.tripCount > 0)
    .sort((a, b) => b.averageMileage - a.averageMileage);
  };

  // Calculate efficiency ranking
  const efficiencyRankingData = () => {
    return driverPerformanceData()
      .map((driver, index) => ({
        ...driver,
        rank: index + 1,
        efficiency_score: driver.averageMileage * 0.7 + (1 / (driver.costPerKm + 0.01)) * 0.3
      }))
      .sort((a, b) => b.efficiency_score - a.efficiency_score);
  };

  const performanceData = driverPerformanceData();
  const rankingData = efficiencyRankingData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Driver Performance</CardTitle>
        <CardDescription>
          Fuel efficiency and driving patterns analysis by driver
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fuel Efficiency by Driver */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Fuel Efficiency by Driver</h3>
          {performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={performanceData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="driver" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  label={{ value: 'Mileage (km/L)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value} km/L`, 'Average Mileage']}
                  labelFormatter={(label) => `Driver: ${label}`}
                />
                <Bar dataKey="averageMileage" fill="#8884d8" name="Average Mileage" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium">No driver performance data available</p>
                <p className="text-sm">Assign drivers to fuel logs to track performance</p>
              </div>
            </div>
          )}
        </div>

        {/* Distance vs Fuel Consumption Scatter Plot */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Distance vs Fuel Consumption</h3>
          {performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart
                data={performanceData}
                margin={{
                  top: 20,
                  right: 30,
                  bottom: 20,
                  left: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="totalDistance" 
                  name="Distance"
                  label={{ value: 'Total Distance (km)', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="totalFuelVolume" 
                  name="Fuel"
                  label={{ value: 'Fuel Volume (L)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value: number, name: string) => [
                    name === 'totalDistance' ? `${value.toLocaleString()} km` : `${value} L`,
                    name === 'totalDistance' ? 'Distance' : 'Fuel Volume'
                  ]}
                  labelFormatter={(label, payload) => 
                    payload && payload[0] ? `Driver: ${payload[0].payload.driver}` : ''
                  }
                />
                <Scatter name="Drivers" dataKey="totalFuelVolume" fill="#82ca9d" />
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium">No scatter plot data available</p>
                <p className="text-sm">More driver data needed for correlation analysis</p>
              </div>
            </div>
          )}
        </div>

        {/* Top Performers Table */}
        {rankingData.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Top Performing Drivers</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-gray-200 px-4 py-2 text-left">Rank</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Driver</th>
                    <th className="border border-gray-200 px-4 py-2 text-right">Avg Mileage</th>
                    <th className="border border-gray-200 px-4 py-2 text-right">Total Distance</th>
                    <th className="border border-gray-200 px-4 py-2 text-right">Cost/km</th>
                    <th className="border border-gray-200 px-4 py-2 text-right">Trips</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingData.slice(0, 10).map((driver, index) => (
                    <tr key={driver.driver} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="border border-gray-200 px-4 py-2 font-medium">
                        #{index + 1}
                      </td>
                      <td className="border border-gray-200 px-4 py-2">{driver.driver}</td>
                      <td className="border border-gray-200 px-4 py-2 text-right">
                        {driver.averageMileage.toFixed(1)} km/L
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-right">
                        {driver.totalDistance.toLocaleString()} km
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-right">
                        ₹{driver.costPerKm.toFixed(2)}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-right">
                        {driver.tripCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Performance Summary */}
        {performanceData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {performanceData.length}
              </div>
              <div className="text-sm text-muted-foreground">Active Drivers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {(performanceData.reduce((sum, d) => sum + d.averageMileage, 0) / performanceData.length).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Fleet Avg Mileage (km/L)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {rankingData[0]?.driver || 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Top Performer</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};