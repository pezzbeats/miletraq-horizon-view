import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Fuel, Droplets, Zap, TrendingDown, TrendingUp, AlertTriangle, Gauge, Calendar } from 'lucide-react';

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

interface MobileTankCardProps {
  tank: FuelTank;
  consumption?: ConsumptionData;
  onRefillClick?: (tank: FuelTank) => void;
}

export function MobileTankCard({ 
  tank, 
  consumption,
  onRefillClick 
}: MobileTankCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const percentage = (tank.current_volume / tank.capacity) * 100;
  const isLowFuel = percentage <= ((tank.low_threshold / tank.capacity) * 100);
  
  const getFuelIcon = (fuelType: string) => {
    switch (fuelType) {
      case 'diesel': return <Fuel className="h-6 w-6 text-blue-600" />;
      case 'petrol': return <Droplets className="h-6 w-6 text-green-600" />;
      case 'cng': return <Zap className="h-6 w-6 text-orange-600" />;
      default: return <Fuel className="h-6 w-6" />;
    }
  };

  const getStatusColor = (percentage: number) => {
    if (percentage > 50) return 'text-green-600';
    if (percentage > 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const calculateDaysRemaining = () => {
    if (!consumption || consumption.daily_rate <= 0) return '∞';
    return Math.floor(tank.current_volume / consumption.daily_rate).toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-IN');
  };

  return (
    <Card className="mobile-tank-card hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getFuelIcon(tank.fuel_type)}
            <div>
              <CardTitle className="text-lg capitalize">{tank.fuel_type} Tank</CardTitle>
              <p className="text-sm text-muted-foreground">{tank.tank_location}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Badge 
              variant={percentage > 50 ? "default" : percentage > 20 ? "secondary" : "destructive"}
              className="text-xs"
            >
              {percentage.toFixed(1)}%
            </Badge>
            {isLowFuel && (
              <div className="flex items-center text-destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                <span className="text-xs">Low</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tank Level Visualization */}
        <div className="space-y-3">
          <div className="relative">
            {/* Circular Tank Gauge */}
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={percentage > 50 ? "hsl(var(--primary))" : percentage > 20 ? "#f97316" : "#ef4444"}
                  strokeWidth="3"
                  strokeDasharray={`${percentage}, 100`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-lg font-bold ${getStatusColor(percentage)}`}>
                    {percentage.toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Full</div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Level */}
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Current Level</div>
            <div className={`text-xl font-bold ${getStatusColor(percentage)}`}>
              {tank.current_volume.toLocaleString()} / {tank.capacity.toLocaleString()} {tank.unit}
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
            </div>
            <div className="text-lg font-bold">{calculateDaysRemaining()}</div>
            <div className="text-xs text-muted-foreground">Days Left</div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Gauge className="h-4 w-4 text-muted-foreground mr-1" />
            </div>
            <div className="text-lg font-bold">{tank.low_threshold}</div>
            <div className="text-xs text-muted-foreground">Threshold {tank.unit}</div>
          </div>
        </div>

        {/* Consumption Data */}
        {consumption && (
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Consumption Rate</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 p-1 text-xs"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Less' : 'More'}
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-sm font-bold">{consumption.daily_rate.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Daily</div>
              </div>
              <div>
                <div className="text-sm font-bold">{consumption.weekly_total.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Weekly</div>
              </div>
              <div>
                <div className="text-sm font-bold">{consumption.monthly_total.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Monthly</div>
              </div>
            </div>

            {expanded && (
              <div className="mt-3 pt-3 border-t space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Avg. consumption per day:</span>
                  <span>{consumption.daily_rate.toFixed(2)} {consumption.unit}/day</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Current burn rate:</span>
                  <Badge variant="outline" className="text-xs">
                    {consumption.daily_rate > 50 ? 'High' : consumption.daily_rate > 20 ? 'Medium' : 'Low'}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Low Fuel Alert */}
        {isLowFuel && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <div>
                <p className="font-medium text-destructive text-sm">Low Fuel Alert</p>
                <p className="text-xs text-destructive/80">
                  Tank level is below threshold. Consider refilling.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button 
            className="w-full touch-target"
            size="sm"
            onClick={() => onRefillClick?.(tank)}
          >
            Record Refill
          </Button>
          
          <div className="text-xs text-center text-muted-foreground">
            Last updated: {formatDate(tank.updated_at)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}