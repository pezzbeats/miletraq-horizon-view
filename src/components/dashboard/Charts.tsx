import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Common chart colors
export const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#64748b',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  gradient: ['#3b82f6', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']
};

interface FuelConsumptionChartProps {
  data: Array<{
    date: string;
    fuel: number;
    cost: number;
  }>;
}

export const FuelConsumptionChart = ({ data }: FuelConsumptionChartProps) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Area 
        type="monotone" 
        dataKey="fuel" 
        stroke={CHART_COLORS.primary} 
        fill={CHART_COLORS.primary}
        fillOpacity={0.3}
        name="Fuel (L)"
      />
    </AreaChart>
  </ResponsiveContainer>
);

interface CostAnalysisChartProps {
  data: Array<{
    month: string;
    fuel: number;
    maintenance: number;
    parts: number;
  }>;
}

export const CostAnalysisChart = ({ data }: CostAnalysisChartProps) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="fuel" fill={CHART_COLORS.primary} name="Fuel Cost" />
      <Bar dataKey="maintenance" fill={CHART_COLORS.warning} name="Maintenance" />
      <Bar dataKey="parts" fill={CHART_COLORS.info} name="Parts" />
    </BarChart>
  </ResponsiveContainer>
);

interface VehicleEfficiencyChartProps {
  data: Array<{
    vehicle: string;
    efficiency: number;
    target: number;
  }>;
}

export const VehicleEfficiencyChart = ({ data }: VehicleEfficiencyChartProps) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data} layout="horizontal">
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis type="number" />
      <YAxis type="category" dataKey="vehicle" width={80} />
      <Tooltip />
      <Legend />
      <Bar dataKey="efficiency" fill={CHART_COLORS.success} name="Current (km/L)" />
      <Bar dataKey="target" fill={CHART_COLORS.secondary} name="Target (km/L)" />
    </BarChart>
  </ResponsiveContainer>
);

interface UtilizationHeatmapProps {
  data: Array<{
    vehicle: string;
    utilization: number;
  }>;
}

export const UtilizationChart = ({ data }: UtilizationHeatmapProps) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="vehicle" />
      <YAxis />
      <Tooltip />
      <Bar 
        dataKey="utilization" 
        fill={CHART_COLORS.info}
        name="Utilization %"
      />
    </BarChart>
  </ResponsiveContainer>
);

interface BudgetPerformanceChartProps {
  data: Array<{
    category: string;
    budgeted: number;
    actual: number;
    variance: number;
  }>;
}

export const BudgetPerformanceChart = ({ data }: BudgetPerformanceChartProps) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="category" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="budgeted" fill={CHART_COLORS.secondary} name="Budgeted" />
      <Bar dataKey="actual" fill={CHART_COLORS.primary} name="Actual" />
    </BarChart>
  </ResponsiveContainer>
);

interface FuelEfficiencyTrendProps {
  data: Array<{
    date: string;
    efficiency: number;
  }>;
}

export const FuelEfficiencyTrendChart = ({ data }: FuelEfficiencyTrendProps) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line 
        type="monotone" 
        dataKey="efficiency" 
        stroke={CHART_COLORS.success} 
        strokeWidth={2}
        name="Efficiency (km/L)"
      />
    </LineChart>
  </ResponsiveContainer>
);

interface CostBreakdownPieChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export const CostBreakdownPieChart = ({ data }: CostBreakdownPieChartProps) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        outerRadius={80}
        dataKey="value"
        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
);

interface TankLevelGaugeProps {
  currentLevel: number;
  capacity: number;
  lowThreshold?: number;
}

export const TankLevelGauge = ({ 
  currentLevel, 
  capacity, 
  lowThreshold = 500 
}: TankLevelGaugeProps) => {
  const percentage = (currentLevel / capacity) * 100;
  const isLow = currentLevel <= lowThreshold;
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="50"
            stroke="currentColor"
            strokeWidth="10"
            fill="none"
            className="text-muted-foreground opacity-20"
          />
          <circle
            cx="60"
            cy="60"
            r="50"
            stroke={isLow ? CHART_COLORS.danger : CHART_COLORS.primary}
            strokeWidth="10"
            fill="none"
            strokeDasharray={`${percentage * 3.14159} ${314.159 - percentage * 3.14159}`}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{percentage.toFixed(1)}%</span>
          <span className="text-xs text-muted-foreground">
            {currentLevel.toLocaleString()}L
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">
          Tank Level
        </p>
        <p className="text-xs text-muted-foreground">
          {currentLevel.toLocaleString()}L / {capacity.toLocaleString()}L
        </p>
        {isLow && (
          <p className="text-xs text-red-600 font-medium mt-1">
            Low Level Alert
          </p>
        )}
      </div>
    </div>
  );
};