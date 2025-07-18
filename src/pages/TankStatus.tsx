import { useState, useEffect } from "react";
import { AlertTriangle, Droplets, TrendingDown, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, subDays, differenceInDays } from "date-fns";

interface FuelTank {
  id: string;
  current_level: number;
  capacity: number;
  low_level_threshold: number;
  last_updated: string;
}

interface FuelActivity {
  id: string;
  date: string;
  type: "purchase" | "consumption";
  volume: number;
  source?: string;
  vehicle?: {
    vehicle_number: string;
  };
  vendor?: {
    name: string;
  };
}

interface ConsumptionStats {
  dailyAverage: number;
  weeklyTotal: number;
  monthlyTotal: number;
  daysRemaining: number;
}

const TankStatus = () => {
  const [tank, setTank] = useState<FuelTank | null>(null);
  const [recentActivity, setRecentActivity] = useState<FuelActivity[]>([]);
  const [stats, setStats] = useState<ConsumptionStats>({
    dailyAverage: 0,
    weeklyTotal: 0,
    monthlyTotal: 0,
    daysRemaining: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchTankData = async () => {
    try {
      setLoading(true);
      
      // Fetch tank status
      const { data: tankData, error: tankError } = await supabase
        .from('fuel_tank')
        .select('*')
        .limit(1)
        .single();

      if (tankError && tankError.code !== 'PGRST116') {
        throw tankError;
      }

      setTank(tankData);

      // Fetch recent purchases (last 10)
      const { data: purchases, error: purchasesError } = await supabase
        .from('fuel_purchases')
        .select(`
          id,
          purchase_date,
          volume,
          vendors (name)
        `)
        .order('purchase_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);

      if (purchasesError) throw purchasesError;

      // Fetch recent fuel consumption (last 10 internal tank entries)
      const { data: consumption, error: consumptionError } = await supabase
        .from('fuel_log')
        .select(`
          id,
          date,
          fuel_volume,
          fuel_source,
          vehicles (vehicle_number)
        `)
        .eq('fuel_source', 'internal_tank')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);

      if (consumptionError) throw consumptionError;

      // Combine and format activity
      const activity: FuelActivity[] = [
        ...(purchases || []).map(p => ({
          id: p.id,
          date: p.purchase_date,
          type: "purchase" as const,
          volume: p.volume,
          source: "Fuel Purchase",
          vendor: p.vendors,
        })),
        ...(consumption || []).map(c => ({
          id: c.id,
          date: c.date,
          type: "consumption" as const,
          volume: c.fuel_volume,
          source: "Internal Tank",
          vehicle: c.vehicles,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setRecentActivity(activity.slice(0, 10));

      // Calculate consumption statistics
      if (consumption && consumption.length > 0) {
        const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
        const monthAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');

        const weeklyConsumption = consumption
          .filter(c => c.date >= weekAgo)
          .reduce((sum, c) => sum + c.fuel_volume, 0);

        const monthlyConsumption = consumption
          .filter(c => c.date >= monthAgo)
          .reduce((sum, c) => sum + c.fuel_volume, 0);

        const dailyAverage = monthlyConsumption / 30;
        const daysRemaining = dailyAverage > 0 ? Math.floor((tankData?.current_level || 0) / dailyAverage) : 0;

        setStats({
          dailyAverage,
          weeklyTotal: weeklyConsumption,
          monthlyTotal: monthlyConsumption,
          daysRemaining,
        });
      }

    } catch (error) {
      console.error('Error fetching tank data:', error);
      toast({
        title: "Error",
        description: "Failed to load tank status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTankData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-muted rounded"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!tank) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <Droplets className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Tank Data Found</h2>
          <p className="text-muted-foreground">
            Tank information will appear here once fuel purchases are recorded.
          </p>
        </div>
      </div>
    );
  }

  const fuelPercentage = (tank.current_level / tank.capacity) * 100;
  const isLowLevel = tank.current_level <= tank.low_level_threshold;
  const isCriticalLevel = fuelPercentage < 10;

  const getTankColor = () => {
    if (isCriticalLevel) return "destructive";
    if (isLowLevel) return "warning";
    return "default";
  };

  const getTankBgColor = () => {
    if (isCriticalLevel) return "bg-destructive";
    if (isLowLevel) return "bg-orange-500";
    return "bg-primary";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tank Status</h1>
          <p className="text-muted-foreground">Monitor fuel inventory and consumption</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Clock className="h-3 w-3 mr-1" />
          Updated {format(new Date(tank.last_updated), "MMM d, h:mm a")}
        </Badge>
      </div>

      {/* Alerts */}
      {(isLowLevel || isCriticalLevel) && (
        <Alert variant={isCriticalLevel ? "destructive" : "default"} className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {isCriticalLevel 
              ? `Critical fuel level! Only ${tank.current_level.toFixed(1)}L remaining (${fuelPercentage.toFixed(1)}%)` 
              : `Low fuel level warning. ${tank.current_level.toFixed(1)}L remaining (${fuelPercentage.toFixed(1)}%)`
            }
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tank Gauge */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                Fuel Tank Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Tank Visual */}
                <div className="relative mx-auto w-48 h-72 border-2 border-muted rounded-b-lg bg-muted/20">
                  <div 
                    className={`absolute bottom-0 left-0 right-0 ${getTankBgColor()} rounded-b-lg transition-all duration-1000 ease-out`}
                    style={{ height: `${fuelPercentage}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center bg-background/90 rounded-lg p-3 backdrop-blur-sm">
                      <div className="text-3xl font-bold">{fuelPercentage.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">
                        {tank.current_level.toFixed(1)}L / {tank.capacity}L
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tank Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {tank.current_level.toFixed(1)}L
                    </div>
                    <div className="text-sm text-muted-foreground">Current Level</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">
                      {stats.daysRemaining}
                    </div>
                    <div className="text-sm text-muted-foreground">Days Remaining</div>
                  </div>
                </div>

                {/* Consumption Stats */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-background border rounded-lg">
                    <div className="text-lg font-semibold">{stats.dailyAverage.toFixed(1)}L</div>
                    <div className="text-xs text-muted-foreground">Daily Avg</div>
                  </div>
                  <div className="p-3 bg-background border rounded-lg">
                    <div className="text-lg font-semibold">{stats.weeklyTotal.toFixed(1)}L</div>
                    <div className="text-xs text-muted-foreground">This Week</div>
                  </div>
                  <div className="p-3 bg-background border rounded-lg">
                    <div className="text-lg font-semibold">{stats.monthlyTotal.toFixed(1)}L</div>
                    <div className="text-xs text-muted-foreground">This Month</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No recent activity</p>
                  </div>
                ) : (
                  recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1 rounded-full ${
                          activity.type === "purchase" 
                            ? "bg-green-100 text-green-600" 
                            : "bg-red-100 text-red-600"
                        }`}>
                          {activity.type === "purchase" ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {activity.type === "purchase" ? "Purchase" : "Consumption"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {activity.vendor?.name || activity.vehicle?.vehicle_number || activity.source}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          activity.type === "purchase" ? "text-green-600" : "text-red-600"
                        }`}>
                          {activity.type === "purchase" ? "+" : "-"}{activity.volume.toFixed(1)}L
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(activity.date), "MMM d")}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TankStatus;