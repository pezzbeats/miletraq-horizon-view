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
  Line
} from "recharts";
import { format, parseISO, startOfDay, differenceInDays } from "date-fns";

interface AnalyticsData {
  odometer: any[];
  vehicles: any[];
}

interface VehicleUtilizationChartProps {
  data: AnalyticsData;
  loading: boolean;
}

export const VehicleUtilizationChart = ({ data, loading }: VehicleUtilizationChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Utilization</CardTitle>
          <CardDescription>Distance covered and usage patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  // Calculate distance covered per vehicle
  const vehicleUtilizationData = () => {
    return data.vehicles.map(vehicle => {
      const vehicleReadings = data.odometer
        .filter(reading => reading.vehicle_id === vehicle.id)
        .sort((a, b) => new Date(a.reading_date).getTime() - new Date(b.reading_date).getTime());

      let totalDistance = 0;
      let dailyAverage = 0;

      if (vehicleReadings.length > 1) {
        const firstReading = vehicleReadings[0];
        const lastReading = vehicleReadings[vehicleReadings.length - 1];
        totalDistance = lastReading.odometer_reading - firstReading.odometer_reading;
        
        const daysDiff = differenceInDays(
          parseISO(lastReading.reading_date),
          parseISO(firstReading.reading_date)
        );
        
        dailyAverage = daysDiff > 0 ? totalDistance / daysDiff : 0;
      }

      return {
        vehicle: vehicle.vehicle_number,
        totalDistance,
        dailyAverage,
        readings: vehicleReadings.length,
        make: vehicle.make,
        model: vehicle.model
      };
    })
    .filter(vehicle => vehicle.totalDistance > 0)
    .sort((a, b) => b.totalDistance - a.totalDistance);
  };

  // Calculate daily utilization trends
  const dailyUtilizationData = () => {
    const dailyData: Record<string, { date: string; totalDistance: number; vehicles: number }> = {};

    data.odometer.forEach(reading => {
      const date = format(parseISO(reading.reading_date), 'MMM dd');
      
      if (!dailyData[date]) {
        dailyData[date] = { date, totalDistance: 0, vehicles: 0 };
      }

      // Calculate distance for this reading (compared to previous reading for same vehicle)
      const vehicleReadings = data.odometer
        .filter(r => r.vehicle_id === reading.vehicle_id)
        .sort((a, b) => new Date(a.reading_date).getTime() - new Date(b.reading_date).getTime());

      const currentIndex = vehicleReadings.findIndex(r => r.id === reading.id);
      if (currentIndex > 0) {
        const previousReading = vehicleReadings[currentIndex - 1];
        const distance = reading.odometer_reading - previousReading.odometer_reading;
        if (distance > 0 && distance < 2000) { // Filter out unrealistic values
          dailyData[date].totalDistance += distance;
          dailyData[date].vehicles += 1;
        }
      }
    });

    return Object.values(dailyData)
      .filter(day => day.totalDistance > 0)
      .sort((a, b) => new Date(a.date + ' 2024').getTime() - new Date(b.date + ' 2024').getTime())
      .slice(-30); // Last 30 days
  };

  const utilizationData = vehicleUtilizationData();
  const dailyData = dailyUtilizationData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Utilization</CardTitle>
        <CardDescription>
          Distance covered and usage patterns across your fleet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vehicle Distance Bar Chart */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Distance Covered by Vehicle</h3>
          {utilizationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={utilizationData}
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
                  label={{ value: 'Distance (km)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'totalDistance' ? `${value.toLocaleString()} km` : `${value.toFixed(1)} km/day`,
                    name === 'totalDistance' ? 'Total Distance' : 'Daily Average'
                  ]}
                  labelFormatter={(label) => `Vehicle: ${label}`}
                />
                <Bar dataKey="totalDistance" fill="#8884d8" name="Total Distance" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium">No utilization data available</p>
                <p className="text-sm">Record odometer readings to track vehicle utilization</p>
              </div>
            </div>
          )}
        </div>

        {/* Daily Trends Line Chart */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Daily Utilization Trends</h3>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={dailyData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis 
                  label={{ value: 'Distance (km)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString()} km`, 'Daily Distance']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="totalDistance" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Fleet Distance"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium">No daily trend data available</p>
                <p className="text-sm">Regular odometer readings will show utilization trends</p>
              </div>
            </div>
          )}
        </div>

        {/* Utilization Summary */}
        {utilizationData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {utilizationData.reduce((sum, v) => sum + v.totalDistance, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Fleet Distance (km)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {(utilizationData.reduce((sum, v) => sum + v.dailyAverage, 0) / utilizationData.length).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Average Daily Usage (km)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {utilizationData.length}
              </div>
              <div className="text-sm text-muted-foreground">Active Vehicles</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};