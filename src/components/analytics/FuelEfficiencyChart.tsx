import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";

interface AnalyticsData {
  fuelLogs: any[];
  vehicles: any[];
}

interface FuelEfficiencyChartProps {
  data: AnalyticsData;
  loading: boolean;
}

export const FuelEfficiencyChart = ({ data, loading }: FuelEfficiencyChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fuel Efficiency Trends</CardTitle>
          <CardDescription>Vehicle mileage performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  // Process data for fuel efficiency trends
  const chartData = data.fuelLogs
    .filter(log => log.mileage && log.mileage > 0)
    .map(log => ({
      date: log.date,
      vehicle: log.vehicles?.vehicle_number || 'Unknown',
      mileage: log.mileage,
      fuelVolume: log.fuel_volume,
      cost: log.total_cost,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Group by date and calculate average mileage
  const aggregatedData = chartData.reduce((acc, log) => {
    const date = log.date;
    if (!acc[date]) {
      acc[date] = {};
    }
    if (!acc[date][log.vehicle]) {
      acc[date][log.vehicle] = [];
    }
    acc[date][log.vehicle].push(log.mileage);
    return acc;
  }, {} as Record<string, Record<string, number[]>>);

  // Convert to chart format
  const processedData = Object.entries(aggregatedData).map(([date, vehicleData]) => {
    const entry: any = { date: format(parseISO(date), 'MMM dd') };
    
    Object.entries(vehicleData).forEach(([vehicle, mileages]) => {
      entry[vehicle] = mileages.reduce((sum, m) => sum + m, 0) / mileages.length;
    });
    
    return entry;
  });

  // Get unique vehicles for chart lines
  const vehicles = Array.from(new Set(chartData.map(log => log.vehicle)));
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fuel Efficiency Trends</CardTitle>
        <CardDescription>
          Vehicle mileage performance over time (km/L)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {processedData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={processedData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis 
                label={{ value: 'Mileage (km/L)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)} km/L`, 'Mileage']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              {vehicles.slice(0, 6).map((vehicle, index) => (
                <Line
                  key={vehicle}
                  type="monotone"
                  dataKey={vehicle}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">No fuel efficiency data available</p>
              <p className="text-sm">Record fuel entries with mileage calculations to see trends</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};