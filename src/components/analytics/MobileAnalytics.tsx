import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileChartCarousel } from '@/components/ui/mobile-chart';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Fuel, 
  Car, 
  Wrench,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface MobileAnalyticsProps {
  data: any;
  loading: boolean;
}

export function MobileAnalytics({ data, loading }: MobileAnalyticsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data processing - replace with actual data processing
  const kpiData = [
    {
      title: 'Total Fleet Cost',
      value: '₹2.4L',
      change: '+12.5%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Fuel Efficiency',
      value: '12.5 km/L',
      change: '-2.1%',
      trend: 'down' as const,
      icon: Fuel,
      color: 'blue'
    },
    {
      title: 'Active Vehicles',
      value: '24',
      change: '+1',
      trend: 'up' as const,
      icon: Car,
      color: 'purple'
    },
    {
      title: 'Maintenance Cost',
      value: '₹45K',
      change: '+8.3%',
      trend: 'up' as const,
      icon: Wrench,
      color: 'orange'
    }
  ];

  const chartData = {
    fuelConsumption: [
      { date: 'Mon', diesel: 120, petrol: 80, cng: 40 },
      { date: 'Tue', diesel: 150, petrol: 90, cng: 50 },
      { date: 'Wed', diesel: 130, petrol: 85, cng: 45 },
      { date: 'Thu', diesel: 170, petrol: 95, cng: 55 },
      { date: 'Fri', diesel: 140, petrol: 88, cng: 48 },
      { date: 'Sat', diesel: 110, petrol: 75, cng: 35 },
      { date: 'Sun', diesel: 90, petrol: 65, cng: 30 }
    ],
    costAnalysis: [
      { month: 'Jan', fuel: 45000, maintenance: 12000, parts: 8000 },
      { month: 'Feb', fuel: 52000, maintenance: 8000, parts: 6000 },
      { month: 'Mar', fuel: 48000, maintenance: 15000, parts: 10000 },
      { month: 'Apr', fuel: 55000, maintenance: 10000, parts: 7000 }
    ],
    vehicleEfficiency: [
      { vehicle: 'V1', efficiency: 14.2, target: 15 },
      { vehicle: 'V2', efficiency: 12.8, target: 15 },
      { vehicle: 'V3', efficiency: 16.1, target: 15 },
      { vehicle: 'V4', efficiency: 11.5, target: 15 },
      { vehicle: 'V5', efficiency: 13.9, target: 15 }
    ]
  };

  const charts = [
    {
      id: 'fuel-consumption',
      title: 'Weekly Fuel Consumption',
      type: 'line' as const,
      data: chartData.fuelConsumption,
      dataKeys: {
        x: 'date',
        y: ['diesel', 'petrol', 'cng'],
        colors: ['#0088FE', '#00C49F', '#FFBB28']
      }
    },
    {
      id: 'cost-breakdown',
      title: 'Monthly Cost Breakdown',
      type: 'bar' as const,
      data: chartData.costAnalysis,
      dataKeys: {
        x: 'month',
        y: ['fuel', 'maintenance', 'parts'],
        colors: ['#0088FE', '#00C49F', '#FFBB28']
      }
    },
    {
      id: 'efficiency',
      title: 'Vehicle Efficiency vs Target',
      type: 'bar' as const,
      data: chartData.vehicleEfficiency,
      dataKeys: {
        x: 'vehicle',
        y: ['efficiency', 'target'],
        colors: ['#00C49F', '#8884D8']
      }
    }
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mobile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="charts" className="text-xs">Charts</TabsTrigger>
          <TabsTrigger value="insights" className="text-xs">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* KPI Cards - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-3">
            {kpiData.map((kpi, index) => (
              <Card key={index} className="mobile-kpi-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <kpi.icon className={`h-5 w-5 text-${kpi.color}-600`} />
                    <Badge 
                      variant={kpi.trend === 'up' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {kpi.trend === 'up' ? 
                        <TrendingUp className="h-3 w-3 mr-1" /> : 
                        <TrendingDown className="h-3 w-3 mr-1" />
                      }
                      {kpi.change}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl font-bold">{kpi.value}</div>
                  <div className="text-xs text-muted-foreground">{kpi.title}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Performance Metrics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Fleet Utilization</span>
                  <span className="font-medium">78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Fuel Efficiency</span>
                  <span className="font-medium">83%</span>
                </div>
                <Progress value={83} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Maintenance Schedule</span>
                  <span className="font-medium">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <MobileChartCarousel charts={charts} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {/* Key Insights Cards */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100 text-sm">
                      Fuel Efficiency Improving
                    </p>
                    <p className="text-green-700 dark:text-green-300 text-xs">
                      Average efficiency increased by 2.3% this month
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-start space-x-2">
                  <TrendingUp className="h-4 w-4 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-900 dark:text-orange-100 text-sm">
                      Maintenance Costs Rising
                    </p>
                    <p className="text-orange-700 dark:text-orange-300 text-xs">
                      8.3% increase in maintenance expenses
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-2">
                  <PieChart className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100 text-sm">
                      Top Cost Category
                    </p>
                    <p className="text-blue-700 dark:text-blue-300 text-xs">
                      Fuel accounts for 67% of total expenses
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm space-y-2">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p>Schedule preventive maintenance for vehicles V2 and V4</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p>Consider fuel training for drivers with low efficiency</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p>Review routes for optimal fuel consumption</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}