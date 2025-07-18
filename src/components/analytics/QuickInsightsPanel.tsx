import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";

interface AnalyticsData {
  fuelLogs: any[];
  maintenanceLogs: any[];
  vehicles: any[];
  budgets: any[];
}

interface QuickInsightsPanelProps {
  data: AnalyticsData;
  loading: boolean;
}

export const QuickInsightsPanel = ({ data, loading }: QuickInsightsPanelProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate top performing vehicles by fuel efficiency
  const topEfficientVehicles = () => {
    const vehicleEfficiency = data.vehicles.map(vehicle => {
      const vehicleFuelLogs = data.fuelLogs.filter(log => log.vehicle_id === vehicle.id && log.mileage > 0);
      const avgMileage = vehicleFuelLogs.length > 0 
        ? vehicleFuelLogs.reduce((sum, log) => sum + log.mileage, 0) / vehicleFuelLogs.length 
        : 0;
      
      return {
        ...vehicle,
        avgMileage: parseFloat(avgMileage.toFixed(2)),
        logCount: vehicleFuelLogs.length
      };
    })
    .filter(vehicle => vehicle.logCount > 0)
    .sort((a, b) => b.avgMileage - a.avgMileage)
    .slice(0, 3);

    return vehicleEfficiency;
  };

  // Calculate highest cost vehicles
  const highestCostVehicles = () => {
    const vehicleCosts = data.vehicles.map(vehicle => {
      const fuelCost = data.fuelLogs
        .filter(log => log.vehicle_id === vehicle.id)
        .reduce((sum, log) => sum + (log.total_cost || 0), 0);
      
      const maintenanceCost = data.maintenanceLogs
        .filter(log => log.vehicle_id === vehicle.id)
        .reduce((sum, log) => sum + (log.total_cost || 0), 0);

      const totalCost = fuelCost + maintenanceCost;
      
      return {
        ...vehicle,
        totalCost,
        fuelCost,
        maintenanceCost
      };
    })
    .filter(vehicle => vehicle.totalCost > 0)
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 3);

    return vehicleCosts;
  };

  // Check for maintenance due vehicles (placeholder - would need maintenance schedule data)
  const maintenanceDueVehicles = () => {
    // This would typically check against maintenance schedules
    // For now, we'll identify vehicles with no recent maintenance
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return data.vehicles
      .filter(vehicle => {
        const recentMaintenance = data.maintenanceLogs
          .filter(log => log.vehicle_id === vehicle.id)
          .filter(log => new Date(log.maintenance_date) > thirtyDaysAgo);
        
        return recentMaintenance.length === 0;
      })
      .slice(0, 3);
  };

  // Check budget alerts
  const budgetAlerts = () => {
    return data.budgets
      .filter(budget => {
        const utilization = budget.budgeted_amount > 0 
          ? (budget.actual_amount / budget.budgeted_amount) * 100 
          : 0;
        return utilization > 80; // Alert if over 80% utilized
      })
      .sort((a, b) => {
        const utilizationA = a.budgeted_amount > 0 ? (a.actual_amount / a.budgeted_amount) * 100 : 0;
        const utilizationB = b.budgeted_amount > 0 ? (b.actual_amount / b.budgeted_amount) * 100 : 0;
        return utilizationB - utilizationA;
      })
      .slice(0, 3);
  };

  const efficientVehicles = topEfficientVehicles();
  const costlyVehicles = highestCostVehicles();
  const maintenanceDue = maintenanceDueVehicles();
  const alerts = budgetAlerts();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Top Efficient Vehicles */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
            Most Efficient
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {efficientVehicles.length > 0 ? (
            <div className="space-y-2">
              {efficientVehicles.map((vehicle, index) => (
                <div key={vehicle.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                    <span className="text-sm font-medium">{vehicle.vehicle_number}</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">
                    {vehicle.avgMileage} km/L
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No efficiency data available</p>
          )}
        </CardContent>
      </Card>

      {/* Highest Cost Vehicles */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <TrendingDown className="h-4 w-4 mr-2 text-red-500" />
            Highest Cost
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {costlyVehicles.length > 0 ? (
            <div className="space-y-2">
              {costlyVehicles.map((vehicle, index) => (
                <div key={vehicle.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                    <span className="text-sm font-medium">{vehicle.vehicle_number}</span>
                  </div>
                  <span className="text-sm text-red-600 font-medium">
                    ₹{(vehicle.totalCost / 1000).toFixed(0)}k
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No cost data available</p>
          )}
        </CardContent>
      </Card>

      {/* Maintenance Due */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
            Maintenance Due
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {maintenanceDue.length > 0 ? (
            <div className="space-y-2">
              {maintenanceDue.map((vehicle) => (
                <div key={vehicle.id} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{vehicle.vehicle_number}</span>
                  <Badge variant="secondary" className="text-xs">
                    No recent service
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="text-sm text-muted-foreground">All vehicles serviced recently</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Alerts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
            Budget Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {alerts.length > 0 ? (
            <div className="space-y-2">
              {alerts.map((budget) => {
                const utilization = budget.budgeted_amount > 0 
                  ? (budget.actual_amount / budget.budgeted_amount) * 100 
                  : 0;
                
                return (
                  <div key={budget.id} className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">{budget.category}</span>
                    <Badge 
                      variant={utilization > 100 ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {utilization.toFixed(0)}%
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="text-sm text-muted-foreground">All budgets on track</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};