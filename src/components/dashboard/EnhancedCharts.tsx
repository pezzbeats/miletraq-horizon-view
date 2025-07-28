import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, 
  LineChart as LineChartIcon, Activity, Download, Maximize2, RefreshCw,
  Calendar, Filter, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChartData {
  name: string;
  value: number;
  value2?: number;
  value3?: number;
  trend?: number;
  color?: string;
  category?: string;
}

interface EnhancedChartsProps {
  data: {
    fuelConsumption: ChartData[];
    costAnalysis: ChartData[];
    fleetEfficiency: ChartData[];
    budgetPerformance: ChartData[];
    maintenanceSchedule: ChartData[];
    driverPerformance: ChartData[];
  };
  loading?: boolean;
  className?: string;
  onExport?: (chartType: string) => void;
  onDrillDown?: (chartType: string, dataPoint: any) => void;
}

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
  pink: '#ec4899',
  orange: '#f97316'
};

const chartTypes = [
  { value: 'overview', label: 'Overview', icon: BarChart3 },
  { value: 'trends', label: 'Trends', icon: LineChartIcon },
  { value: 'distribution', label: 'Distribution', icon: PieChartIcon },
  { value: 'performance', label: 'Performance', icon: Activity }
];

export const EnhancedCharts = ({
  data,
  loading = false,
  className,
  onExport,
  onDrillDown
}: EnhancedChartsProps) => {
  const [activeChart, setActiveChart] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.dataKey}:</span>
              <span className="font-medium">
                {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const ChartContainer = ({ 
    title, 
    subtitle, 
    children, 
    type,
    trend,
    actions 
  }: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    type: string;
    trend?: { value: number; direction: 'up' | 'down' };
    actions?: React.ReactNode;
  }) => (
    <Card className={cn(
      'relative transition-all duration-300 hover:shadow-lg',
      expandedChart === type && 'col-span-full row-span-2'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {title}
              {trend && (
                <Badge variant={trend.direction === 'up' ? 'default' : 'destructive'} className="text-xs">
                  {trend.direction === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {trend.value}%
                </Badge>
              )}
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {actions}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedChart(expandedChart === type ? null : type)}
              className="h-8 w-8 p-0"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            {onExport && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onExport(type)}
                className="h-8 w-8 p-0"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-6', className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-32"></div>
              <div className="h-4 bg-muted rounded w-48"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Chart Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Tabs value={activeChart} onValueChange={setActiveChart} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto bg-muted/50">
            {chartTypes.map(type => (
              <TabsTrigger 
                key={type.value} 
                value={type.value}
                className="flex items-center gap-2 p-3"
              >
                <type.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{type.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
              <SelectItem value="1y">1 year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chart Content */}
      <Tabs value={activeChart} className="w-full">
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fuel Consumption */}
            <ChartContainer 
              title="Fuel Consumption" 
              subtitle="Daily fuel usage trends"
              type="fuel-consumption"
              trend={{ value: 12, direction: 'down' }}
            >
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data.fuelConsumption}>
                  <defs>
                    <linearGradient id="fuelGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={COLORS.primary}
                    fill="url(#fuelGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Cost Analysis */}
            <ChartContainer 
              title="Cost Analysis" 
              subtitle="Operational cost breakdown"
              type="cost-analysis"
              trend={{ value: 8, direction: 'up' }}
            >
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.costAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill={COLORS.success} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="value2" fill={COLORS.warning} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Fleet Efficiency */}
            <ChartContainer 
              title="Fleet Efficiency" 
              subtitle="Vehicle performance metrics"
              type="fleet-efficiency"
              trend={{ value: 15, direction: 'up' }}
            >
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.fleetEfficiency}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={COLORS.info}
                    strokeWidth={3}
                    dot={{ fill: COLORS.info, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Budget Performance */}
            <ChartContainer 
              title="Budget Performance" 
              subtitle="Budget vs actual spending"
              type="budget-performance"
              trend={{ value: 5, direction: 'down' }}
            >
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.budgetPerformance}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.budgetPerformance.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={Object.values(COLORS)[index % Object.values(COLORS).length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <ChartContainer 
              title="Comprehensive Trend Analysis" 
              subtitle="Multi-metric performance over time"
              type="comprehensive-trends"
            >
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.fuelConsumption}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    name="Fuel Consumption"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value2" 
                    stroke={COLORS.success}
                    strokeWidth={2}
                    name="Efficiency"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value3" 
                    stroke={COLORS.warning}
                    strokeWidth={2}
                    name="Costs"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer 
              title="Cost Distribution" 
              subtitle="Breakdown of operational costs"
              type="cost-distribution"
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.costAnalysis}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.costAnalysis.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={Object.values(COLORS)[index % Object.values(COLORS).length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer 
              title="Fleet Distribution" 
              subtitle="Vehicle performance distribution"
              type="fleet-distribution"
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.fleetEfficiency} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" className="text-xs" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill={COLORS.purple} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer 
              title="Driver Performance" 
              subtitle="Driver efficiency metrics"
              type="driver-performance"
            >
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.driverPerformance}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill={COLORS.orange} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer 
              title="Maintenance Schedule" 
              subtitle="Upcoming maintenance activities"
              type="maintenance-schedule"
            >
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data.maintenanceSchedule}>
                  <defs>
                    <linearGradient id="maintenanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.error} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS.error} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={COLORS.error}
                    fill="url(#maintenanceGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};