import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award, 
  AlertTriangle,
  BarChart3,
  DollarSign,
  Fuel,
  Gauge,
  Clock,
  Users,
  Zap
} from 'lucide-react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { cn } from '@/lib/utils';

interface BenchmarkData {
  category: string;
  current: number;
  industry: number;
  best: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  performance: 'excellent' | 'good' | 'average' | 'poor';
}

interface PerformanceBenchmarkingProps {
  data: {
    fuelEfficiency: number;
    costPerKm: number;
    maintenanceCost: number;
    driverSafety: number;
    utilizationRate: number;
    fuelCostPerLiter: number;
  };
  className?: string;
}

export const PerformanceBenchmarking = ({
  data,
  className
}: PerformanceBenchmarkingProps) => {
  const [benchmarks, setBenchmarks] = useState<BenchmarkData[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [ranking, setRanking] = useState({ current: 0, total: 0 });

  useEffect(() => {
    generateBenchmarks();
  }, [data]);

  const generateBenchmarks = () => {
    const benchmarkData: BenchmarkData[] = [
      {
        category: 'Fuel Efficiency',
        current: data.fuelEfficiency || 12.5,
        industry: 11.2,
        best: 15.8,
        target: 14.0,
        unit: 'km/L',
        trend: 'up',
        performance: data.fuelEfficiency > 13 ? 'excellent' : data.fuelEfficiency > 11.5 ? 'good' : 'average'
      },
      {
        category: 'Cost per KM',
        current: data.costPerKm || 8.50,
        industry: 9.20,
        best: 6.80,
        target: 7.50,
        unit: '₹/km',
        trend: 'down',
        performance: data.costPerKm < 7.50 ? 'excellent' : data.costPerKm < 9.00 ? 'good' : 'average'
      },
      {
        category: 'Maintenance Cost',
        current: data.maintenanceCost || 2.10,
        industry: 2.45,
        best: 1.60,
        target: 1.90,
        unit: '₹/km',
        trend: 'down',
        performance: data.maintenanceCost < 1.90 ? 'excellent' : data.maintenanceCost < 2.30 ? 'good' : 'average'
      },
      {
        category: 'Vehicle Utilization',
        current: data.utilizationRate || 78,
        industry: 72,
        best: 89,
        target: 85,
        unit: '%',
        trend: 'up',
        performance: data.utilizationRate > 85 ? 'excellent' : data.utilizationRate > 75 ? 'good' : 'average'
      },
      {
        category: 'Driver Safety Score',
        current: data.driverSafety || 85,
        industry: 78,
        best: 96,
        target: 90,
        unit: '/100',
        trend: 'up',
        performance: data.driverSafety > 90 ? 'excellent' : data.driverSafety > 80 ? 'good' : 'average'
      },
      {
        category: 'Fuel Cost per Liter',
        current: data.fuelCostPerLiter || 105.50,
        industry: 108.20,
        best: 98.30,
        target: 102.00,
        unit: '₹/L',
        trend: 'down',
        performance: data.fuelCostPerLiter < 102 ? 'excellent' : data.fuelCostPerLiter < 107 ? 'good' : 'average'
      }
    ];

    setBenchmarks(benchmarkData);

    // Calculate overall performance score
    const scores = benchmarkData.map(b => {
      const performance = b.performance;
      switch (performance) {
        case 'excellent': return 100;
        case 'good': return 80;
        case 'average': return 60;
        case 'poor': return 40;
        default: return 60;
      }
    });

    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    setOverallScore(avgScore);

    // Simulate ranking
    setRanking({
      current: Math.floor(avgScore / 10) + 12,
      total: 150
    });
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'text-green-600 bg-green-50 dark:bg-green-950/20';
      case 'good': return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20';
      case 'average': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20';
      case 'poor': return 'text-red-600 bg-red-50 dark:bg-red-950/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'excellent': return <Award className="h-4 w-4" />;
      case 'good': return <TrendingUp className="h-4 w-4" />;
      case 'average': return <Target className="h-4 w-4" />;
      case 'poor': return <AlertTriangle className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  // Prepare radar chart data
  const radarData = benchmarks.map(b => ({
    category: b.category.split(' ')[0],
    current: ((b.current / b.best) * 100),
    industry: ((b.industry / b.best) * 100),
    target: ((b.target / b.best) * 100)
  }));

  // Prepare comparison chart data
  const comparisonData = benchmarks.map(b => ({
    name: b.category,
    current: b.current,
    industry: b.industry,
    best: b.best,
    target: b.target
  }));

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
              <span className="font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-500" />
            Performance Benchmarking
          </h2>
          <p className="text-muted-foreground mt-1">
            Compare your fleet performance against industry standards
          </p>
        </div>
      </div>

      {/* Overall Performance Score */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Overall Performance Score</span>
            <Badge variant="outline" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
              Industry Comparison
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {overallScore.toFixed(1)}/100
                </div>
                <div className="text-muted-foreground">Performance Score</div>
              </div>
              <Progress value={overallScore} className="h-3" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Poor</span>
                <span className="text-muted-foreground">Average</span>
                <span className="text-muted-foreground">Excellent</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
                <div className="text-lg font-bold text-green-600">#{ranking.current}</div>
                <div className="text-xs text-muted-foreground">Industry Rank</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{ranking.total}</div>
                <div className="text-xs text-muted-foreground">Total Companies</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {benchmarks.filter(b => b.performance === 'excellent').length}
                </div>
                <div className="text-xs text-muted-foreground">Excellent KPIs</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg">
                <div className="text-lg font-bold text-orange-600">
                  {benchmarks.filter(b => b.performance === 'poor').length}
                </div>
                <div className="text-xs text-muted-foreground">Need Improvement</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Benchmarks */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="radar">Performance Radar</TabsTrigger>
          <TabsTrigger value="comparison">Detailed Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benchmarks.map((benchmark, index) => (
              <Card key={index} className="relative overflow-hidden">
                <div className={cn(
                  'absolute top-0 left-0 right-0 h-1',
                  benchmark.performance === 'excellent' ? 'bg-green-500' :
                  benchmark.performance === 'good' ? 'bg-blue-500' :
                  benchmark.performance === 'average' ? 'bg-yellow-500' :
                  'bg-red-500'
                )} />
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{benchmark.category}</CardTitle>
                    <div className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                      getPerformanceColor(benchmark.performance)
                    )}>
                      {getPerformanceIcon(benchmark.performance)}
                      {benchmark.performance}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold">
                        {benchmark.current.toFixed(1)}{benchmark.unit}
                      </div>
                      <div className="text-xs text-muted-foreground">Your Fleet</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-muted-foreground">
                        {benchmark.industry.toFixed(1)}{benchmark.unit}
                      </div>
                      <div className="text-xs text-muted-foreground">Industry Avg</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>vs Industry</span>
                      <span className={cn(
                        'font-medium',
                        benchmark.current > benchmark.industry ? 
                          (benchmark.trend === 'up' ? 'text-green-600' : 'text-red-600') :
                          (benchmark.trend === 'up' ? 'text-red-600' : 'text-green-600')
                      )}>
                        {benchmark.trend === 'up' ? 
                          (benchmark.current > benchmark.industry ? '+' : '') :
                          (benchmark.current < benchmark.industry ? '+' : '')
                        }
                        {Math.abs(((benchmark.current - benchmark.industry) / benchmark.industry) * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Target</span>
                      <span className="font-medium">
                        {benchmark.target.toFixed(1)}{benchmark.unit}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Best in Class</span>
                      <span className="font-medium text-green-600">
                        {benchmark.best.toFixed(1)}{benchmark.unit}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="radar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Radar Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" className="text-xs" />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    className="text-xs"
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Radar
                    name="Current Performance"
                    dataKey="current"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Industry Average"
                    dataKey="industry"
                    stroke="#6b7280"
                    fill="#6b7280"
                    fillOpacity={0.1}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                  <Radar
                    name="Target"
                    dataKey="target"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.1}
                    strokeWidth={2}
                    strokeDasharray="3 3"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="current" name="Your Fleet" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="industry" name="Industry Avg" fill="#6b7280" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="target" name="Target" fill="#10b981" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="best" name="Best in Class" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};