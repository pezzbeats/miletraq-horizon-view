import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useSubsidiary } from "@/contexts/SubsidiaryContext";
import { format, subDays } from "date-fns";

interface ChartData {
  fuelConsumption: Array<{date: string, diesel: number, petrol: number, cng: number}>;
  costAnalysis: Array<{month: string, fuel: number, maintenance: number, parts: number}>;
  fleetEfficiency: Array<{vehicle: string, current: number, target: number}>;
  budgetPerformance: Array<{category: string, budgeted: number, actual: number}>;
}

export const Charts = () => {
  const [chartData, setChartData] = useState<ChartData>({
    fuelConsumption: [],
    costAnalysis: [],
    fleetEfficiency: [],
    budgetPerformance: []
  });
  const [loading, setLoading] = useState(true);
  const { currentSubsidiary } = useSubsidiary();

  useEffect(() => {
    if (currentSubsidiary?.id) {
      fetchChartData();
    }
  }, [currentSubsidiary]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchFuelConsumptionData(),
        fetchCostAnalysisData(),
        fetchFleetEfficiencyData(),
        fetchBudgetData()
      ]);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFuelConsumptionData = async () => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    
    const { data, error } = await supabase
      .from('fuel_log')
      .select('date, fuel_type, fuel_volume')
      .eq('subsidiary_id', currentSubsidiary?.id)
      .gte('date', format(thirtyDaysAgo, 'yyyy-MM-dd'))
      .order('date');

    if (error) throw error;

    // Group by date and fuel type
    const grouped = (data || []).reduce((acc, log) => {
      const date = log.date;
      if (!acc[date]) {
        acc[date] = { date, diesel: 0, petrol: 0, cng: 0 };
      }
      const fuelType = log.fuel_type as 'diesel' | 'petrol' | 'cng';
      if (fuelType && ['diesel', 'petrol', 'cng'].includes(fuelType)) {
        acc[date][fuelType] += log.fuel_volume;
      }
      return acc;
    }, {} as Record<string, {date: string, diesel: number, petrol: number, cng: number}>);

    setChartData(prev => ({
      ...prev,
      fuelConsumption: Object.values(grouped).slice(-7) // Last 7 days
    }));
  };

  const fetchCostAnalysisData = async () => {
    const sixMonthsAgo = subDays(new Date(), 180);
    
    // Fetch fuel costs
    const { data: fuelData, error: fuelError } = await supabase
      .from('fuel_log')
      .select('date, total_cost')
      .eq('subsidiary_id', currentSubsidiary?.id)
      .gte('date', format(sixMonthsAgo, 'yyyy-MM-dd'));

    if (fuelError) throw fuelError;

    // Fetch maintenance costs
    const { data: maintenanceData, error: maintenanceError } = await supabase
      .from('maintenance_log')
      .select('maintenance_date, total_cost')
      .eq('subsidiary_id', currentSubsidiary?.id)
      .gte('maintenance_date', format(sixMonthsAgo, 'yyyy-MM-dd'));

    if (maintenanceError) throw maintenanceError;

    // Group by month
    const monthlyData = {} as Record<string, {month: string, fuel: number, maintenance: number, parts: number}>;
    
    // Process fuel data
    (fuelData || []).forEach(log => {
      const month = format(new Date(log.date), 'MMM');
      if (!monthlyData[month]) {
        monthlyData[month] = { month, fuel: 0, maintenance: 0, parts: 0 };
      }
      monthlyData[month].fuel += log.total_cost || 0;
    });

    // Process maintenance data
    (maintenanceData || []).forEach(log => {
      const month = format(new Date(log.maintenance_date), 'MMM');
      if (!monthlyData[month]) {
        monthlyData[month] = { month, fuel: 0, maintenance: 0, parts: 0 };
      }
      monthlyData[month].maintenance += log.total_cost || 0;
    });

    setChartData(prev => ({
      ...prev,
      costAnalysis: Object.values(monthlyData).slice(-4) // Last 4 months
    }));
  };

  const fetchFleetEfficiencyData = async () => {
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('id, vehicle_number')
      .eq('subsidiary_id', currentSubsidiary?.id)
      .eq('status', 'active')
      .limit(5);

    if (vehiclesError) throw vehiclesError;

    // Calculate efficiency for each vehicle
    const efficiencyData = await Promise.all(
      (vehicles || []).map(async (vehicle) => {
        const { data: fuelData } = await supabase
          .from('fuel_log')
          .select('mileage')
          .eq('vehicle_id', vehicle.id)
          .not('mileage', 'is', null)
          .order('date', { ascending: false })
          .limit(10);

        const avgMileage = fuelData && fuelData.length > 0 
          ? fuelData.reduce((sum, log) => sum + (log.mileage || 0), 0) / fuelData.length 
          : 0;

        return {
          vehicle: vehicle.vehicle_number,
          current: avgMileage,
          target: 15 // Default target km/L
        };
      })
    );

    setChartData(prev => ({
      ...prev,
      fleetEfficiency: efficiencyData
    }));
  };

  const fetchBudgetData = async () => {
    const { data: budgets, error } = await supabase
      .from('budget')
      .select('category, budgeted_amount, actual_amount')
      .eq('subsidiary_id', currentSubsidiary?.id)
      .eq('status', 'active');

    if (error) throw error;

    const budgetData = (budgets || []).map(budget => ({
      category: budget.category.charAt(0).toUpperCase() + budget.category.slice(1),
      budgeted: budget.budgeted_amount,
      actual: budget.actual_amount || 0
    }));

    setChartData(prev => ({
      ...prev,
      budgetPerformance: budgetData
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[300px] bg-muted rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Cross-Subsidiary Fuel Consumption */}
      <div className="bg-white dark:bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Fuel Consumption Trends</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData.fuelConsumption}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="diesel" stroke="#0088FE" strokeWidth={2} name="Diesel (L)" />
            <Line type="monotone" dataKey="petrol" stroke="#00C49F" strokeWidth={2} name="Petrol (L)" />
            <Line type="monotone" dataKey="cng" stroke="#FFBB28" strokeWidth={2} name="CNG (kg)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Consolidated Cost Analysis */}
      <div className="bg-white dark:bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Cost Analysis</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData.costAnalysis}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']} />
            <Legend />
            <Bar dataKey="fuel" fill="#0088FE" name="Fuel Cost" />
            <Bar dataKey="maintenance" fill="#00C49F" name="Maintenance" />
            <Bar dataKey="parts" fill="#FFBB28" name="Parts" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Fleet Efficiency Comparison */}
      <div className="bg-white dark:bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Fleet Efficiency</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData.fleetEfficiency}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="vehicle" />
            <YAxis />
            <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} km/L`, '']} />
            <Legend />
            <Bar dataKey="current" fill="#00C49F" name="Current (km/L)" />
            <Bar dataKey="target" fill="#8884D8" name="Target (km/L)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Budget Performance Overview */}
      <div className="bg-white dark:bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Budget Performance</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData.budgetPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']} />
            <Legend />
            <Bar dataKey="budgeted" fill="#8884D8" name="Budgeted" />
            <Bar dataKey="actual" fill="#0088FE" name="Actual" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};