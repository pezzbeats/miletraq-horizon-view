import React from 'react';
import { cn } from '@/lib/utils';

interface FuelGaugeProps {
  value: number;
  max: number;
  label?: string;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
  showNeedle?: boolean;
}

export const FuelGauge: React.FC<FuelGaugeProps> = ({
  value,
  max,
  label,
  unit,
  size = 'md',
  className,
  animated = true,
  showNeedle = true
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const angle = (percentage / 100) * 180 - 90; // -90 to 90 degrees
  
  const sizes = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40'
  };

  const getGaugeColor = (percent: number): string => {
    if (percent >= 60) return 'var(--status-success)';
    if (percent >= 30) return 'var(--status-warning)';
    return 'var(--status-danger)';
  };

  return (
    <div className={cn("flex flex-col items-center space-y-2", className)}>
      <div className={cn(
        "relative rounded-full border-4 border-border",
        "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900",
        sizes[size]
      )}>
        {/* Gauge Background */}
        <div className="absolute inset-2 rounded-full bg-muted/50" />
        
        {/* Gauge Fill */}
        <div 
          className={cn(
            "absolute inset-2 rounded-full transition-all duration-1000 ease-out",
            animated && "animate-dashboard-glow"
          )}
          style={{
            background: `conic-gradient(from 180deg, ${getGaugeColor(percentage)} 0deg, ${getGaugeColor(percentage)} ${percentage * 1.8}deg, transparent ${percentage * 1.8}deg)`
          }}
        />
        
        {/* Center Circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-border rounded-full z-10" />
        
        {/* Needle */}
        {showNeedle && (
          <div
            className={cn(
              "absolute top-1/2 left-1/2 origin-bottom w-0.5 bg-red-500 rounded-full z-20 transition-transform duration-500 ease-out",
              size === 'sm' ? 'h-8' : size === 'md' ? 'h-12' : 'h-16'
            )}
            style={{
              transform: `translate(-50%, -100%) rotate(${angle}deg)`,
              transformOrigin: 'bottom center'
            }}
          />
        )}
        
        {/* Value Display */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-xs font-mono font-bold">
            {value}{unit && ` ${unit}`}
          </div>
        </div>
      </div>
      
      {label && (
        <div className="text-sm font-medium text-muted-foreground text-center">
          {label}
        </div>
      )}
    </div>
  );
};