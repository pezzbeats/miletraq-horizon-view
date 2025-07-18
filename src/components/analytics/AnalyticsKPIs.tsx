import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Car, Fuel, DollarSign, Gauge } from "lucide-react";

interface AnalyticsData {
  fuelLogs: any[];
  maintenanceLogs: any[];
  budgets: any[];
  vehicles: any[];
  drivers: any[];
  odometer: any[];
}

interface AnalyticsKPIsProps {
  data: AnalyticsData;
  loading: boolean;
}

export const AnalyticsKPIs = ({ data, loading }: AnalyticsKPIsProps) => {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
              <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded animate-pulse w-16 mb-1"></div>
              <div className="h-4 bg-muted rounded animate-pulse w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate KPIs
  const totalDistance = data.odometer.reduce((sum, reading) => {
    const vehicleReadings = data.odometer
      .filter(r => r.vehicle_id === reading.vehicle_id)
      .sort((a, b) => new Date(a.reading_date).getTime() - new Date(b.reading_date).getTime());
    
    if (vehicleReadings.length > 1) {
      const firstReading = vehicleReadings[0];
      const lastReading = vehicleReadings[vehicleReadings.length - 1];
      return sum + (lastReading.odometer_reading - firstReading.odometer_reading);
    }
    return sum;
  }, 0) / data.vehicles.length || 0;

  const totalFuelCost = data.fuelLogs.reduce((sum, log) => sum + (log.total_cost || 0), 0);
  const totalFuelVolume = data.fuelLogs.reduce((sum, log) => sum + (log.fuel_volume || 0), 0);
  const averageMileage = totalFuelVolume > 0 ? totalDistance / totalFuelVolume : 0;

  const totalMaintenanceCost = data.maintenanceLogs.reduce((sum, log) => sum + (log.total_cost || 0), 0);
  const costPerKm = totalDistance > 0 ? (totalFuelCost + totalMaintenanceCost) / totalDistance : 0;

  // Find most efficient vehicle
  const vehicleEfficiency = data.vehicles.map(vehicle => {
    const vehicleFuelLogs = data.fuelLogs.filter(log => log.vehicle_id === vehicle.id);
    const totalVolume = vehicleFuelLogs.reduce((sum, log) => sum + (log.fuel_volume || 0), 0);
    const vehicleDistance = vehicleFuelLogs.reduce((sum, log) => sum + (log.km_driven || 0), 0);
    const efficiency = totalVolume > 0 ? vehicleDistance / totalVolume : 0;
    
    return {
      ...vehicle,
      efficiency,
      totalCost: vehicleFuelLogs.reduce((sum, log) => sum + (log.total_cost || 0), 0) +
                data.maintenanceLogs.filter(log => log.vehicle_id === vehicle.id)
                  .reduce((sum, log) => sum + (log.total_cost || 0), 0)
    };
  });

  const mostEfficientVehicle = vehicleEfficiency.reduce((best, current) => 
    current.efficiency > best.efficiency ? current : best, vehicleEfficiency[0] || { efficiency: 0, vehicle_number: 'N/A' });

  const highestCostVehicle = vehicleEfficiency.reduce((highest, current) => 
    current.totalCost > highest.totalCost ? current : highest, vehicleEfficiency[0] || { totalCost: 0, vehicle_number: 'N/A' });

  const kpis = [
    {
      title: "Fleet Distance",
      value: `${totalDistance.toFixed(0)} km`,
      description: "Total distance covered",
      icon: Car,
      trend: "up" as const,
    },
    {
      title: "Avg Mileage",
      value: `${averageMileage.toFixed(1)} km/L`,
      description: "Fleet fuel efficiency",
      icon: Gauge,
      trend: "up" as const,
    },
    {
      title: "Fuel Cost",
      value: `₹${totalFuelCost.toLocaleString('en-IN')}`,
      description: "Total fuel expenses",
      icon: Fuel,
      trend: "down" as const,
    },
    {
      title: "Cost per KM",
      value: `₹${costPerKm.toFixed(2)}`,
      description: "Operating cost efficiency",
      icon: DollarSign,
      trend: "down" as const,
    },
    {
      title: "Most Efficient",
      value: mostEfficientVehicle.vehicle_number,
      description: `${mostEfficientVehicle.efficiency.toFixed(1)} km/L`,
      icon: TrendingUp,
      trend: "up" as const,
    },
    {
      title: "Highest Cost",
      value: highestCostVehicle.vehicle_number,
      description: `₹${highestCostVehicle.totalCost.toLocaleString('en-IN')}`,
      icon: TrendingDown,
      trend: "down" as const,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">
                {kpi.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};