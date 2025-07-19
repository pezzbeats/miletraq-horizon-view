import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Fuel, Droplets, Zap, TrendingDown, TrendingUp, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSubsidiary } from "@/contexts/SubsidiaryContext";
import { Button } from "@/components/ui/button";
import { MobileTankCard } from "@/components/tank-status/MobileTankCard";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface FuelTank {
  id: string;
  fuel_type: 'diesel' | 'petrol' | 'cng';
  current_volume: number;
  capacity: number;
  low_threshold: number;
  unit: 'liters' | 'kg';
  tank_location: string;
  updated_at: string;
}

interface ConsumptionData {
  fuel_type: string;
  daily_rate: number;
  weekly_total: number;
  monthly_total: number;
  unit: string;
}

export default function TankStatus() {
  const [tanks, setTanks] = useState<FuelTank[]>([]);
  const [consumption, setConsumption] = useState<ConsumptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentSubsidiary } = useSubsidiary();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (currentSubsidiary?.id) {
      fetchTankData();
      fetchConsumptionData();
    }
  }, [currentSubsidiary]);

  const fetchTankData = async () => {
    try {
      const { data, error } = await supabase
        .from('fuel_tanks')
        .select('*')
        .eq('subsidiary_id', currentSubsidiary?.id)
        .eq('is_active', true)
        .order('fuel_type');

      if (error) throw error;
      setTanks(data || []);
    } catch (error) {
      console.error('Error fetching tank data:', error);
    }
  };

  const fetchConsumptionData = async () => {
    try {
      setLoading(false);
      // Fetch fuel consumption data for analytics
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('fuel_log')
        .select('fuel_type, fuel_volume, date, unit')
        .eq('subsidiary_id', currentSubsidiary?.id)
        .eq('fuel_source', 'internal_tank')
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

      if (error) throw error;

      // Process consumption data
      const consumptionByType = (data || []).reduce((acc, log) => {
        const type = log.fuel_type || 'diesel';
        if (!acc[type]) {
          acc[type] = { volumes: [], unit: log.unit || 'liters' };
        }
        acc[type].volumes.push({
          volume: log.fuel_volume,
          date: new Date(log.date)
        });
        return acc;
      }, {} as Record<string, { volumes: Array<{volume: number, date: Date}>, unit: string }>);

      const processedConsumption = Object.entries(consumptionByType).map(([fuel_type, data]) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);

        const dailyVolumes = data.volumes.filter(v => v.date >= yesterday);
        const weeklyVolumes = data.volumes.filter(v => v.date >= weekAgo);
        const monthlyVolumes = data.volumes;

        return {
          fuel_type,
          daily_rate: dailyVolumes.reduce((sum, v) => sum + v.volume, 0),
          weekly_total: weeklyVolumes.reduce((sum, v) => sum + v.volume, 0),
          monthly_total: monthlyVolumes.reduce((sum, v) => sum + v.volume, 0),
          unit: data.unit
        };
      });

      setConsumption(processedConsumption);
    } catch (error) {
      console.error('Error fetching consumption data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFuelIcon = (fuelType: string) => {
    switch (fuelType) {
      case 'diesel': return <Fuel className="h-6 w-6 text-blue-600" />;
      case 'petrol': return <Droplets className="h-6 w-6 text-green-600" />;
      case 'cng': return <Zap className="h-6 w-6 text-orange-600" />;
      default: return <Fuel className="h-6 w-6" />;
    }
  };

  const getFuelColor = (fuelType: string) => {
    switch (fuelType) {
      case 'diesel': return 'blue';
      case 'petrol': return 'green';
      case 'cng': return 'orange';
      default: return 'gray';
    }
  };

  const getStatusColor = (percentage: number) => {
    if (percentage > 50) return 'text-green-600';
    if (percentage > 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const calculateDaysRemaining = (currentVolume: number, dailyConsumption: number) => {
    if (dailyConsumption <= 0) return '∞';
    return Math.floor(currentVolume / dailyConsumption).toString();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Tank Status</h1>
            <p className="text-muted-foreground">Monitor fuel tank levels and consumption</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded"></div>
                  <div className="h-2 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tank Status</h1>
          <p className="text-muted-foreground">Monitor fuel tank levels and consumption patterns</p>
        </div>
        <Button onClick={() => window.location.href = '/tank-refills'}>
          <Plus className="h-4 w-4 mr-2" />
          Add Fuel Purchase
        </Button>
      </div>

      {/* Tank Status Display - Mobile Cards or Desktop Cards */}
      {isMobile ? (
        <div className="grid grid-cols-1 gap-4">
          {tanks.map((tank) => {
            const consumptionData = consumption.find(c => c.fuel_type === tank.fuel_type);
            return (
              <MobileTankCard
                key={tank.id}
                tank={tank}
                consumption={consumptionData}
                onRefillClick={() => window.location.href = '/tank-refills'}
              />
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tanks.map((tank) => {
            const percentage = (tank.current_volume / tank.capacity) * 100;
            const consumptionData = consumption.find(c => c.fuel_type === tank.fuel_type);
            const daysRemaining = consumptionData 
              ? calculateDaysRemaining(tank.current_volume, consumptionData.daily_rate)
              : '∞';

            return (
              <Card key={tank.id} className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getFuelIcon(tank.fuel_type)}
                      <div>
                        <CardTitle className="text-lg capitalize">{tank.fuel_type} Tank</CardTitle>
                        <CardDescription>{tank.tank_location}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={percentage > 50 ? "default" : percentage > 20 ? "secondary" : "destructive"}>
                      {percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current Level</span>
                      <span className={getStatusColor(percentage)}>
                        {tank.current_volume.toLocaleString()} / {tank.capacity.toLocaleString()} {tank.unit}
                      </span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-3"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Days Remaining</p>
                      <p className="font-semibold text-lg">{daysRemaining}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Low Threshold</p>
                      <p className="font-medium">{tank.low_threshold} {tank.unit}</p>
                    </div>
                  </div>

                  {percentage <= ((tank.low_threshold / tank.capacity) * 100) && (
                    <div className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 p-3 rounded-lg">
                      <p className="font-medium">⚠️ Low Fuel Alert</p>
                      <p className="text-sm">Tank level is below threshold</p>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Last updated: {format(new Date(tank.updated_at || Date.now()), 'MMM dd, yyyy HH:mm')}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Consumption Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Consumption Analytics</CardTitle>
            <CardDescription>Fuel usage patterns and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {consumption.map((data) => (
                <div key={data.fuel_type} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getFuelIcon(data.fuel_type)}
                      <span className="font-medium capitalize">{data.fuel_type}</span>
                    </div>
                    <Badge variant="outline">{data.unit}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Daily</p>
                      <p className="font-semibold">{data.daily_rate.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Weekly</p>
                      <p className="font-semibold">{data.weekly_total.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Monthly</p>
                      <p className="font-semibold">{data.monthly_total.toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tank Management</CardTitle>
            <CardDescription>Quick actions and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.location.href = '/tank-refills'}
            >
              <Plus className="h-4 w-4 mr-2" />
              Record Fuel Purchase
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.location.href = '/fuel-log'}
            >
              <TrendingDown className="h-4 w-4 mr-2" />
              View Fuel Consumption
            </Button>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Quick Insights</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Tank Capacity</span>
                  <span>{tanks.reduce((sum, tank) => sum + tank.capacity, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Total Volume</span>
                  <span>{tanks.reduce((sum, tank) => sum + tank.current_volume, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Overall Utilization</span>
                  <span>
                    {tanks.length > 0 
                      ? ((tanks.reduce((sum, tank) => sum + tank.current_volume, 0) / 
                         tanks.reduce((sum, tank) => sum + tank.capacity, 0)) * 100).toFixed(1)
                      : '0'}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}