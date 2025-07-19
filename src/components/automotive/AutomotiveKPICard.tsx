import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AutomotiveKPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'fuel' | 'maintenance' | 'driver' | 'alert' | 'default';
  showOdometer?: boolean;
  className?: string;
}

export const AutomotiveKPICard: React.FC<AutomotiveKPICardProps> = ({
  title,
  value,
  unit,
  icon,
  trend,
  trendValue,
  variant = 'default',
  showOdometer = false,
  className
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const targetValue = typeof value === 'number' ? value : parseFloat(value.toString()) || 0;

  useEffect(() => {
    if (showOdometer) {
      const duration = 1500;
      const steps = 30;
      const increment = targetValue / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
          setDisplayValue(targetValue);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    } else {
      setDisplayValue(targetValue);
    }
  }, [targetValue, showOdometer]);

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <span className="text-success">↗</span>;
      case 'down':
        return <span className="text-destructive">↘</span>;
      default:
        return null;
    }
  };

  const getStatusLed = () => {
    switch (variant) {
      case 'fuel':
        return <div className="status-led active" />;
      case 'maintenance':
        return <div className="status-led warning" />;
      case 'driver':
        return <div className="status-led active" />;
      case 'alert':
        return <div className="status-led critical" />;
      default:
        return <div className="status-led service" />;
    }
  };

  return (
    <Card className={cn("automotive-card", variant, className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
              {getStatusLed()}
            </div>
          </div>
          {getTrendIcon()}
        </div>
        
        <div className="space-y-2">
          {showOdometer ? (
            <div className="odometer-display">
              <div className="odometer-number animate-odometer-roll">
                {displayValue.toLocaleString()}
                {unit && <span className="text-lg ml-1 opacity-80">{unit}</span>}
              </div>
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </span>
              {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
            </div>
          )}
          
          {trendValue && (
            <div className="flex items-center gap-1 text-xs">
              {getTrendIcon()}
              <span className="text-muted-foreground">{trendValue}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};