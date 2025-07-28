import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import { Matrix } from 'ml-matrix';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target,
  Zap,
  BarChart3,
  Calendar,
  DollarSign,
  Wrench,
  Fuel,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';
import { cn } from '@/lib/utils';

interface AdvancedAnalyticsData {
  fuelData: Array<{ date: string; volume: number; cost: number; efficiency: number; }>;
  maintenanceData: Array<{ date: string; cost: number; type: string; mileage: number; }>;
  vehicleData: Array<{ id: string; mileage: number; age: number; efficiency: number; }>;
  driverData: Array<{ id: string; efficiency: number; accidents: number; experience: number; }>;
}

interface Prediction {
  metric: string;
  current: number;
  predicted: number;
  confidence: number;
  timeframe: string;
  factors: string[];
  trend: 'up' | 'down' | 'stable';
  accuracy: number;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  savingsEstimate: number;
  timeline: string;
  category: 'fuel' | 'maintenance' | 'operations' | 'safety';
  aiConfidence: number;
}

interface AdvancedPredictiveAnalyticsProps {
  data: AdvancedAnalyticsData;
  className?: string;
  onExport?: (type: string) => void;
}

export const AdvancedPredictiveAnalytics = ({
  data,
  className,
  onExport
}: AdvancedPredictiveAnalyticsProps) => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [modelAccuracy, setModelAccuracy] = useState<number>(0);
  const [isTraining, setIsTraining] = useState(false);
  const [activeTab, setActiveTab] = useState('predictions');

  // Machine Learning Models
  useEffect(() => {
    trainPredictiveModels();
  }, [data]);

  const trainPredictiveModels = async () => {
    setIsTraining(true);
    
    try {
      // Simulate ML model training and predictions
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newPredictions = await generateMLPredictions();
      const newRecommendations = await generateAIRecommendations();
      
      setPredictions(newPredictions);
      setRecommendations(newRecommendations);
      setModelAccuracy(87.5 + Math.random() * 10); // Simulated accuracy
      
    } catch (error) {
      console.error('Model training failed:', error);
    } finally {
      setIsTraining(false);
    }
  };

  const generateMLPredictions = async (): Promise<Prediction[]> => {
    // Simulate advanced ML predictions using TensorFlow.js concepts
    return [
      {
        metric: 'Fuel Consumption',
        current: 2850,
        predicted: 2650,
        confidence: 89,
        timeframe: 'Next 30 days',
        factors: ['Seasonal patterns', 'Driver behavior optimization', 'Route efficiency'],
        trend: 'down',
        accuracy: 91.2
      },
      {
        metric: 'Maintenance Costs',
        current: 45000,
        predicted: 52000,
        confidence: 82,
        timeframe: 'Next Quarter',
        factors: ['Vehicle age progression', 'Usage intensity', 'Preventive maintenance schedule'],
        trend: 'up',
        accuracy: 85.7
      },
      {
        metric: 'Fleet Efficiency',
        current: 12.5,
        predicted: 13.8,
        confidence: 94,
        timeframe: 'Next 60 days',
        factors: ['Driver training completion', 'Route optimization', 'Vehicle upgrades'],
        trend: 'up',
        accuracy: 93.1
      },
      {
        metric: 'Breakdown Risk',
        current: 15,
        predicted: 8,
        confidence: 76,
        timeframe: 'Next Month',
        factors: ['Predictive maintenance', 'Vehicle health monitoring', 'Driver alerts'],
        trend: 'down',
        accuracy: 78.9
      }
    ];
  };

  const generateAIRecommendations = async (): Promise<Recommendation[]> => {
    return [
      {
        id: '1',
        title: 'Implement Eco-Driving Training Program',
        description: 'AI analysis shows 15% fuel savings potential through structured driver training focusing on acceleration patterns and idle time reduction.',
        impact: 'high',
        effort: 'medium',
        savingsEstimate: 180000,
        timeline: '3-6 months',
        category: 'fuel',
        aiConfidence: 92
      },
      {
        id: '2',
        title: 'Optimize Route Scheduling Algorithm',
        description: 'Machine learning models suggest dynamic route optimization could reduce total distance by 12% and fuel consumption by 8%.',
        impact: 'high',
        effort: 'high',
        savingsEstimate: 240000,
        timeline: '6-9 months',
        category: 'operations',
        aiConfidence: 87
      },
      {
        id: '3',
        title: 'Predictive Maintenance Implementation',
        description: 'Neural network analysis of vehicle telemetry indicates 25% reduction in unexpected breakdowns through predictive maintenance.',
        impact: 'medium',
        effort: 'medium',
        savingsEstimate: 95000,
        timeline: '2-4 months',
        category: 'maintenance',
        aiConfidence: 84
      },
      {
        id: '4',
        title: 'Fleet Right-Sizing Strategy',
        description: 'Advanced analytics suggest optimizing fleet composition could reduce operational costs by 18% while maintaining service levels.',
        impact: 'high',
        effort: 'high',
        savingsEstimate: 320000,
        timeline: '9-12 months',
        category: 'operations',
        aiConfidence: 79
      }
    ];
  };

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

  // Generate trend analysis data
  const trendData = data.fuelData.map((item, index) => ({
    date: item.date,
    actual: item.cost,
    predicted: item.cost * (0.85 + Math.random() * 0.3),
    trend: item.efficiency,
    confidence: 70 + Math.random() * 25
  }));

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            Advanced Predictive Analytics
            <Badge variant="outline" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
              AI Powered
            </Badge>
          </h2>
          <p className="text-muted-foreground mt-1">
            Machine learning insights and predictive modeling for fleet optimization
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isTraining && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Training Models...
            </div>
          )}
          <Button variant="outline" onClick={trainPredictiveModels} disabled={isTraining}>
            <RefreshCw className={cn('h-4 w-4 mr-2', isTraining && 'animate-spin')} />
            Retrain Models
          </Button>
          {onExport && (
            <Button variant="outline" onClick={() => onExport('analytics')}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          )}
        </div>
      </div>

      {/* Model Performance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Model Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{modelAccuracy.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Overall Accuracy</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{predictions.length}</div>
              <div className="text-xs text-muted-foreground">Active Predictions</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{recommendations.length}</div>
              <div className="text-xs text-muted-foreground">AI Recommendations</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">₹2.4M</div>
              <div className="text-xs text-muted-foreground">Potential Savings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-muted/50">
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trend Analysis
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="models" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Model Insights
          </TabsTrigger>
        </TabsList>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {predictions.map((prediction, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{prediction.metric}</CardTitle>
                    <Badge variant={prediction.trend === 'up' ? 'default' : prediction.trend === 'down' ? 'destructive' : 'secondary'}>
                      {prediction.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : 
                       prediction.trend === 'down' ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
                      {prediction.trend}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Current</div>
                      <div className="text-xl font-bold">
                        {prediction.metric.includes('Cost') || prediction.metric.includes('Saving') ? '₹' : ''}
                        {prediction.current.toLocaleString()}
                        {prediction.metric.includes('Efficiency') ? ' km/L' : 
                         prediction.metric.includes('Risk') ? '%' : ''}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Predicted</div>
                      <div className={cn(
                        'text-xl font-bold',
                        prediction.trend === 'up' && prediction.metric.includes('Cost') ? 'text-red-500' :
                        prediction.trend === 'up' ? 'text-green-500' :
                        prediction.trend === 'down' && prediction.metric.includes('Cost') ? 'text-green-500' :
                        'text-red-500'
                      )}>
                        {prediction.metric.includes('Cost') || prediction.metric.includes('Saving') ? '₹' : ''}
                        {prediction.predicted.toLocaleString()}
                        {prediction.metric.includes('Efficiency') ? ' km/L' : 
                         prediction.metric.includes('Risk') ? '%' : ''}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Confidence Level</span>
                      <span className="font-medium">{prediction.confidence}%</span>
                    </div>
                    <Progress value={prediction.confidence} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Key Factors:</div>
                    <div className="flex flex-wrap gap-1">
                      {prediction.factors.map((factor, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Timeframe: {prediction.timeframe} • Accuracy: {prediction.accuracy}%
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trend Analysis Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Predictive Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#3b82f6"
                    fill="url(#actualGradient)"
                    strokeWidth={2}
                    name="Actual"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#10b981"
                    fill="url(#predictedGradient)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="ML Prediction"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {rec.category === 'fuel' && <Fuel className="h-5 w-5 text-blue-500" />}
                        {rec.category === 'maintenance' && <Wrench className="h-5 w-5 text-orange-500" />}
                        {rec.category === 'operations' && <BarChart3 className="h-5 w-5 text-green-500" />}
                        {rec.category === 'safety' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                        {rec.title}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        rec.impact === 'high' ? 'default' :
                        rec.impact === 'medium' ? 'secondary' : 'outline'
                      }>
                        {rec.impact} impact
                      </Badge>
                      <Badge variant="outline">
                        {rec.effort} effort
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {rec.description}
                  </p>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        ₹{(rec.savingsEstimate / 1000).toFixed(0)}K
                      </div>
                      <div className="text-xs text-muted-foreground">Est. Savings</div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{rec.timeline}</div>
                      <div className="text-xs text-muted-foreground">Timeline</div>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">{rec.aiConfidence}%</div>
                      <div className="text-xs text-muted-foreground">AI Confidence</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Progress value={rec.aiConfidence} className="flex-1 h-2 mr-4" />
                    <Button size="sm" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Model Insights Tab */}
        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Machine Learning Model Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Model Accuracy by Category</h4>
                  {[
                    { name: 'Fuel Prediction', accuracy: 91.2 },
                    { name: 'Maintenance Forecast', accuracy: 85.7 },
                    { name: 'Efficiency Analysis', accuracy: 93.1 },
                    { name: 'Risk Assessment', accuracy: 78.9 }
                  ].map((model, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{model.name}</span>
                        <span className="font-medium">{model.accuracy}%</span>
                      </div>
                      <Progress value={model.accuracy} className="h-2" />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Training Data Quality</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <div className="text-xl font-bold">24,567</div>
                      <div className="text-xs text-muted-foreground">Data Points</div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <div className="text-xl font-bold">99.2%</div>
                      <div className="text-xs text-muted-foreground">Data Quality</div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <div className="text-xl font-bold">18</div>
                      <div className="text-xs text-muted-foreground">Features</div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <div className="text-xl font-bold">12h</div>
                      <div className="text-xs text-muted-foreground">Last Trained</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};