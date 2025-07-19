import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Users, Car, TrendingUp, ArrowUpRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSubsidiary } from '@/contexts/SubsidiaryContext';

interface SubsidiaryOverviewItem {
  id: string;
  subsidiary_name: string;
  subsidiary_code: string;
  business_type: string;
  vehicle_count: number;
  active_drivers: number;
  monthly_fuel_cost: number;
  maintenance_cost: number;
  budget_utilization: number;
  alert_count: number;
  efficiency_trend: 'up' | 'down' | 'stable';
}

interface SubsidiaryOverviewProps {
  className?: string;
}

export const SubsidiaryOverview = ({ className = '' }: SubsidiaryOverviewProps) => {
  const [subsidiaries, setSubsidiaries] = useState<SubsidiaryOverviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { setCurrentSubsidiary } = useSubsidiary();

  useEffect(() => {
    fetchSubsidiaryOverview();
  }, []);

  const fetchSubsidiaryOverview = async () => {
    try {
      setLoading(true);

      // Fetch subsidiaries
      const { data: subsidiariesData, error: subsidiariesError } = await supabase
        .from('subsidiaries')
        .select('id, subsidiary_name, subsidiary_code, business_type')
        .eq('is_active', true)
        .order('subsidiary_name');

      if (subsidiariesError) throw subsidiariesError;

      // For each subsidiary, fetch metrics
      const subsidiaryMetrics = await Promise.all(
        (subsidiariesData || []).map(async (subsidiary) => {
          // Vehicle count
          const { count: vehicleCount } = await supabase
            .from('vehicles')
            .select('*', { count: 'exact', head: true })
            .eq('subsidiary_id', subsidiary.id);

          // Active drivers count
          const { count: driverCount } = await supabase
            .from('drivers')
            .select('*', { count: 'exact', head: true })
            .eq('subsidiary_id', subsidiary.id)
            .eq('is_active', true);

          // Fuel cost this month
          const currentMonth = new Date();
          const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
          
          const { data: fuelData } = await supabase
            .from('fuel_log')
            .select('total_cost')
            .eq('subsidiary_id', subsidiary.id)
            .gte('date', startOfMonth.toISOString());

          const monthlyFuelCost = fuelData?.reduce((sum, log) => sum + (log.total_cost || 0), 0) || 0;

          // Maintenance cost this month
          const { data: maintenanceData } = await supabase
            .from('maintenance_log')
            .select('total_cost')
            .eq('subsidiary_id', subsidiary.id)
            .gte('maintenance_date', startOfMonth.toISOString());

          const maintenanceCost = maintenanceData?.reduce((sum, log) => sum + (log.total_cost || 0), 0) || 0;

          // Budget utilization (simplified calculation)
          const { data: budgetData } = await supabase
            .from('budget')
            .select('budgeted_amount, actual_amount')
            .eq('subsidiary_id', subsidiary.id)
            .gte('period_start', startOfMonth.toISOString())
            .single();

          const budgetUtilization = budgetData 
            ? ((budgetData.actual_amount || 0) / (budgetData.budgeted_amount || 1)) * 100
            : 0;

          // Get real alert count
          const alertPromises = [
            // Document expiry alerts
            supabase
              .from('vehicle_documents')
              .select('id')
              .eq('subsidiary_id', subsidiary.id)
              .lte('expiry_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()),
            // Driver license expiry alerts  
            supabase
              .from('drivers')
              .select('id')
              .eq('subsidiary_id', subsidiary.id)
              .lte('license_expiry', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()),
            // Low fuel tank alerts
            supabase
              .from('fuel_tanks')
              .select('id, current_volume, capacity, low_threshold')
              .eq('subsidiary_id', subsidiary.id)
          ];

          const [docsData, driversData, tanksData] = await Promise.all(alertPromises);
          
          let alertCount = 0;
          alertCount += docsData.data?.length || 0;
          alertCount += driversData.data?.length || 0;
          
          // Check fuel tanks below threshold
          if (tanksData.data) {
            tanksData.data.forEach((tank: any) => {
              const currentPercentage = (tank.current_volume / tank.capacity) * 100;
              const lowThresholdPercentage = (tank.low_threshold / tank.capacity) * 100;
              if (currentPercentage <= lowThresholdPercentage) {
                alertCount++;
              }
            });
          }

          // Calculate efficiency trend from last month vs current month
          const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
          const endOfLastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);
          
          const [currentFuelData, lastFuelData] = await Promise.all([
            supabase
              .from('fuel_log')
              .select('fuel_volume, km_driven')
              .eq('subsidiary_id', subsidiary.id)
              .gte('date', startOfMonth.toISOString()),
            supabase
              .from('fuel_log')
              .select('fuel_volume, km_driven')
              .eq('subsidiary_id', subsidiary.id)
              .gte('date', lastMonth.toISOString())
              .lte('date', endOfLastMonth.toISOString())
          ]);

          const calculateEfficiency = (data: any[]) => {
            const totalFuel = data?.reduce((sum, log) => sum + (log.fuel_volume || 0), 0) || 0;
            const totalKm = data?.reduce((sum, log) => sum + (log.km_driven || 0), 0) || 0;
            return totalFuel > 0 ? totalKm / totalFuel : 0;
          };

          const currentEfficiency = calculateEfficiency(currentFuelData.data || []);
          const lastEfficiency = calculateEfficiency(lastFuelData.data || []);
          
          let efficiencyTrend: 'up' | 'down' | 'stable' = 'stable';
          if (currentEfficiency > lastEfficiency * 1.05) efficiencyTrend = 'up';
          else if (currentEfficiency < lastEfficiency * 0.95) efficiencyTrend = 'down';

          return {
            ...subsidiary,
            vehicle_count: vehicleCount || 0,
            active_drivers: driverCount || 0,
            monthly_fuel_cost: monthlyFuelCost,
            maintenance_cost: maintenanceCost,
            budget_utilization: Math.min(budgetUtilization, 100),
            alert_count: alertCount,
            efficiency_trend: efficiencyTrend
          };
        })
      );

      setSubsidiaries(subsidiaryMetrics);
    } catch (error) {
      console.error('Error fetching subsidiary overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubsidiary = (subsidiary: SubsidiaryOverviewItem) => {
    setCurrentSubsidiary({
      id: subsidiary.id,
      subsidiary_name: subsidiary.subsidiary_name,
      subsidiary_code: subsidiary.subsidiary_code,
      business_type: subsidiary.business_type as 'construction' | 'hospitality' | 'education' | 'other',
      gstin: '',
      registered_address: '',
      contact_person: '',
      phone: '',
      email: '',
      logo_url: '',
      is_active: true
    });
  };

  const getBusinessTypeColor = (type: string) => {
    switch (type) {
      case 'construction':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'hospitality':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'education':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getBudgetUtilizationColor = (utilization: number) => {
    if (utilization <= 70) return 'text-green-600';
    if (utilization <= 90) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-500" />
            Subsidiary Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-500" />
          Subsidiary Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {subsidiaries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No subsidiaries found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subsidiaries.map((subsidiary) => (
              <Card key={subsidiary.id} className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{subsidiary.subsidiary_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {subsidiary.subsidiary_code}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${getBusinessTypeColor(subsidiary.business_type)}`}>
                            {subsidiary.business_type}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className={`h-4 w-4 ${
                          subsidiary.efficiency_trend === 'up' ? 'text-green-500' :
                          subsidiary.efficiency_trend === 'down' ? 'text-red-500' :
                          'text-gray-500'
                        }`} />
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Vehicles:</span>
                        <span className="font-medium">{subsidiary.vehicle_count}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Drivers:</span>
                        <span className="font-medium">{subsidiary.active_drivers}</span>
                      </div>
                    </div>

                    {/* Costs */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fuel Cost:</span>
                        <span className="font-medium">₹{subsidiary.monthly_fuel_cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Maintenance:</span>
                        <span className="font-medium">₹{subsidiary.maintenance_cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Budget Usage:</span>
                        <span className={`font-medium ${getBudgetUtilizationColor(subsidiary.budget_utilization)}`}>
                          {subsidiary.budget_utilization.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Alerts */}
                    {subsidiary.alert_count > 0 && (
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-xs">
                          {subsidiary.alert_count} alerts
                        </Badge>
                      </div>
                    )}

                    {/* Action */}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleViewSubsidiary(subsidiary)}
                    >
                      View Details
                      <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};