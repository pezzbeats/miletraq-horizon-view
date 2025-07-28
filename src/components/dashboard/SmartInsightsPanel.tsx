import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2,
  Lightbulb,
  Target,
  Zap,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Insight {
  id: string;
  type: 'trend' | 'anomaly' | 'prediction' | 'recommendation' | 'achievement';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  action?: {
    label: string;
    onClick: () => void;
  };
  data?: any;
  category?: string;
}

interface PredictiveInsight {
  metric: string;
  currentValue: number;
  predictedValue: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  timeframe: string;
  factors: string[];
}

interface SmartInsightsPanelProps {
  data: {
    fuelConsumption: any[];
    maintenance: any[];
    costs: any[];
    efficiency: any[];
  };
  className?: string;
  onInsightAction?: (insight: Insight) => void;
}

export const SmartInsightsPanel = ({
  data,
  className,
  onInsightAction
}: SmartInsightsPanelProps) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [predictions, setPredictions] = useState<PredictiveInsight[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate AI-powered insights
  useEffect(() => {
    const generateInsights = () => {
      const generatedInsights: Insight[] = [];

      // Fuel Efficiency Trend Analysis
      if (data.fuelConsumption.length >= 7) {
        const recent = data.fuelConsumption.slice(-7);
        const older = data.fuelConsumption.slice(-14, -7);
        const recentAvg = recent.reduce((sum, day) => sum + day.value, 0) / recent.length;
        const olderAvg = older.reduce((sum, day) => sum + day.value, 0) / older.length;
        
        if (recentAvg < olderAvg * 0.9) {
          generatedInsights.push({
            id: 'fuel-efficiency-improvement',
            type: 'achievement',
            title: 'Fuel Efficiency Improved',
            description: `Fuel consumption decreased by ${((olderAvg - recentAvg) / olderAvg * 100).toFixed(1)}% compared to last week`,
            confidence: 95,
            impact: 'high',
            category: 'Fuel Management'
          });
        }
      }

      // Maintenance Prediction
      if (data.maintenance.length > 0) {
        generatedInsights.push({
          id: 'maintenance-prediction',
          type: 'prediction',
          title: 'Upcoming Maintenance Required',
          description: 'Based on usage patterns, 3 vehicles will likely need maintenance within 2 weeks',
          confidence: 78,
          impact: 'medium',
          action: {
            label: 'Schedule Maintenance',
            onClick: () => window.location.href = '/maintenance'
          },
          category: 'Maintenance'
        });
      }

      // Cost Anomaly Detection
      if (data.costs.length >= 30) {
        const recentCosts = data.costs.slice(-7);
        const avgCost = recentCosts.reduce((sum, day) => sum + day.value, 0) / recentCosts.length;
        const historicalAvg = data.costs.reduce((sum, day) => sum + day.value, 0) / data.costs.length;
        
        if (avgCost > historicalAvg * 1.2) {
          generatedInsights.push({
            id: 'cost-anomaly',
            type: 'anomaly',
            title: 'Unusual Cost Spike Detected',
            description: `Daily costs are 20% higher than normal. Investigate fuel prices or vehicle issues.`,
            confidence: 88,
            impact: 'high',
            action: {
              label: 'Investigate Costs',
              onClick: () => window.location.href = '/analytics'
            },
            category: 'Cost Management'
          });
        }
      }

      // Driver Performance Insight
      generatedInsights.push({
        id: 'driver-performance',
        type: 'recommendation',
        title: 'Driver Training Opportunity',
        description: 'Eco-driving training could reduce fuel consumption by 8-12% based on current patterns',
        confidence: 82,
        impact: 'medium',
        action: {
          label: 'Plan Training',
          onClick: () => window.location.href = '/drivers'
        },
        category: 'Driver Management'
      });

      // Route Optimization
      generatedInsights.push({
        id: 'route-optimization',
        type: 'recommendation',
        title: 'Route Optimization Potential',
        description: 'AI analysis suggests optimizing 5 regular routes could save ₹15,000/month in fuel costs',
        confidence: 91,
        impact: 'high',
        action: {
          label: 'Optimize Routes',
          onClick: () => console.log('Route optimization')
        },
        category: 'Operations'
      });

      setInsights(generatedInsights);

      // Generate predictions
      const generatedPredictions: PredictiveInsight[] = [
        {
          metric: 'Monthly Fuel Cost',
          currentValue: 85000,
          predictedValue: 92000,
          trend: 'up',
          confidence: 87,
          timeframe: 'Next Month',
          factors: ['Seasonal demand increase', 'Route expansion', 'Fuel price trends']
        },
        {
          metric: 'Fleet Efficiency',
          currentValue: 12.5,
          predictedValue: 13.2,
          trend: 'up',
          confidence: 73,
          timeframe: 'Next Quarter',
          factors: ['Driver training program', 'Vehicle maintenance schedule', 'Route optimization']
        },
        {
          metric: 'Maintenance Costs',
          currentValue: 45000,
          predictedValue: 38000,
          trend: 'down',
          confidence: 81,
          timeframe: 'Next Month',
          factors: ['Preventive maintenance', 'Vehicle age optimization', 'Parts inventory management']
        }
      ];

      setPredictions(generatedPredictions);
      setLoading(false);
    };

    // Simulate AI processing time
    const timer = setTimeout(generateInsights, 1500);
    return () => clearTimeout(timer);
  }, [data]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return TrendingUp;
      case 'anomaly': return AlertTriangle;
      case 'prediction': return Brain;
      case 'recommendation': return Lightbulb;
      case 'achievement': return CheckCircle2;
      default: return Activity;
    }
  };

  const getInsightColor = (type: string, impact: string) => {
    if (type === 'achievement') return 'text-green-500 bg-green-50 dark:bg-green-950/20';
    if (type === 'anomaly') return 'text-red-500 bg-red-50 dark:bg-red-950/20';
    if (impact === 'high') return 'text-orange-500 bg-orange-50 dark:bg-orange-950/20';
    if (impact === 'medium') return 'text-blue-500 bg-blue-50 dark:bg-blue-950/20';
    return 'text-gray-500 bg-gray-50 dark:bg-gray-950/20';
  };

  if (loading) {
    return (
      <Card className={cn('h-fit', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 animate-pulse" />
            AI Insights
            <Badge variant="outline" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
              Processing
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full mb-1"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* AI Insights */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Smart Insights
            <Badge variant="outline" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
              AI Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight) => {
            const Icon = getInsightIcon(insight.type);
            
            return (
              <div
                key={insight.id}
                className={cn(
                  'p-4 rounded-lg border transition-all duration-200 hover:shadow-md',
                  getInsightColor(insight.type, insight.impact)
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                    insight.type === 'achievement' ? 'bg-green-100 dark:bg-green-900/30' :
                    insight.type === 'anomaly' ? 'bg-red-100 dark:bg-red-900/30' :
                    insight.impact === 'high' ? 'bg-orange-100 dark:bg-orange-900/30' :
                    'bg-blue-100 dark:bg-blue-900/30'
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          'text-xs',
                          insight.impact === 'high' ? 'border-red-200 text-red-700' :
                          insight.impact === 'medium' ? 'border-orange-200 text-orange-700' :
                          'border-gray-200 text-gray-700'
                        )}
                      >
                        {insight.impact} impact
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {insight.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Confidence: {insight.confidence}%
                        </span>
                        <Progress value={insight.confidence} className="w-16 h-1" />
                      </div>

                      {insight.action && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            insight.action?.onClick();
                            onInsightAction?.(insight);
                          }}
                          className="h-7 text-xs"
                        >
                          {insight.action.label}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Predictive Analytics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Predictive Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {predictions.map((prediction, index) => (
            <div key={index} className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">{prediction.metric}</h4>
                <Badge variant="outline" className="text-xs">
                  {prediction.timeframe}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-xs text-muted-foreground">Current</div>
                  <div className="text-lg font-bold">
                    {prediction.metric.includes('Cost') ? '₹' : ''}
                    {prediction.currentValue.toLocaleString()}
                    {prediction.metric.includes('Efficiency') ? ' km/L' : ''}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Predicted</div>
                  <div className={cn(
                    'text-lg font-bold flex items-center gap-1',
                    prediction.trend === 'up' ? 'text-red-500' : 'text-green-500'
                  )}>
                    {prediction.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {prediction.metric.includes('Cost') ? '₹' : ''}
                    {prediction.predictedValue.toLocaleString()}
                    {prediction.metric.includes('Efficiency') ? ' km/L' : ''}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Confidence:</span>
                  <Progress value={prediction.confidence} className="flex-1 h-1" />
                  <span className="text-xs font-medium">{prediction.confidence}%</span>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">Key Factors:</div>
                  <div className="flex flex-wrap gap-1">
                    {prediction.factors.map((factor, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};