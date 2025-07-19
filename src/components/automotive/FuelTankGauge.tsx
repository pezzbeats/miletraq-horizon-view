import React from 'react';
import { cn } from "@/lib/utils";

interface FuelTankGaugeProps {
  level: number; // 0-100
  capacity: number;
  currentAmount: number;
  label: string;
  className?: string;
}

export const FuelTankGauge: React.FC<FuelTankGaugeProps> = ({
  level,
  capacity,
  currentAmount,
  label,
  className
}) => {
  const getStatusColor = () => {
    if (level > 50) return 'from-gauge-green to-gauge-blue';
    if (level > 20) return 'from-gauge-yellow to-gauge-orange';
    return 'from-gauge-red to-automotive-red';
  };

  const getStatusLed = () => {
    if (level > 50) return 'status-led active';
    if (level > 20) return 'status-led warning';
    return 'status-led critical';
  };

  return (
    <div className={cn("automotive-card fuel", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">{label}</h3>
        <div className={getStatusLed()} />
      </div>
      
      <div className="fuel-tank mb-4">
        <div 
          className={cn("fuel-level bg-gradient-to-t", getStatusColor())}
          style={{ height: `${level}%` }}
        />
        
        {/* Fuel level indicator */}
        <div className="absolute top-2 left-2 right-2 flex justify-between text-xs text-white/80">
          <span>E</span>
          <span>F</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-foreground">{level}%</div>
          <div className="text-xs text-muted-foreground">Level</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground">{currentAmount}</div>
          <div className="text-xs text-muted-foreground">Liters</div>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-center text-muted-foreground">
        Capacity: {capacity} L
      </div>
    </div>
  );
};