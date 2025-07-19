import React, { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";

interface SpeedometerGaugeProps {
  value: number;
  max: number;
  min?: number;
  label: string;
  unit: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'fuel' | 'efficiency' | 'cost' | 'utilization';
  className?: string;
}

export const SpeedometerGauge: React.FC<SpeedometerGaugeProps> = ({
  value,
  max,
  min = 0,
  label,
  unit,
  size = 'md',
  variant = 'efficiency',
  className
}) => {
  const [currentValue, setCurrentValue] = useState(min);
  const [needleAngle, setNeedleAngle] = useState(-90);

  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64'
  };

  const gaugeColors = {
    fuel: 'from-automotive-blue to-automotive-navy',
    efficiency: 'from-gauge-green via-gauge-yellow to-gauge-red',
    cost: 'from-gauge-red via-gauge-yellow to-gauge-green',
    utilization: 'from-automotive-blue to-automotive-green'
  };

  useEffect(() => {
    const animationDuration = 1500;
    const steps = 60;
    const valueStep = (value - min) / steps;
    const angleStep = 180 / steps; // -90 to +90 degrees
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const newValue = min + (valueStep * step);
      const newAngle = -90 + (angleStep * step * (value - min) / (max - min));
      
      setCurrentValue(newValue);
      setNeedleAngle(newAngle);
      
      if (step >= steps || newValue >= value) {
        setCurrentValue(value);
        setNeedleAngle(-90 + (180 * (value - min) / (max - min)));
        clearInterval(timer);
      }
    }, animationDuration / steps);

    return () => clearInterval(timer);
  }, [value, min, max]);

  const getPerformanceColor = () => {
    const percentage = (currentValue - min) / (max - min);
    if (percentage < 0.3) return 'text-gauge-red';
    if (percentage < 0.7) return 'text-gauge-yellow';
    return 'text-gauge-green';
  };

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <div className={cn("gauge-container", sizeClasses[size])}>
        {/* Gauge Background */}
        <div className="absolute inset-2 rounded-full bg-dashboard">
          {/* Gauge markings */}
          <div className="absolute inset-0 rounded-full">
            {[...Array(11)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-4 bg-dashboard-foreground/30"
                style={{
                  top: '10px',
                  left: '50%',
                  transformOrigin: `0 ${size === 'lg' ? '118px' : size === 'md' ? '86px' : '54px'}`,
                  transform: `translateX(-50%) rotate(${-90 + (i * 18)}deg)`
                }}
              />
            ))}
          </div>
          
          {/* Speedometer Needle */}
          <div
            className="speedometer-needle"
            style={{
              transform: `translate(-50%, -50%) rotate(${needleAngle}deg)`,
              height: size === 'lg' ? '90px' : size === 'md' ? '70px' : '50px'
            }}
          />
          
          {/* Center Hub */}
          <div className="speedometer-center" />
          
          {/* Value Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
            <div className={cn("text-center", getPerformanceColor())}>
              <div className={cn("font-mono font-bold", {
                'text-lg': size === 'sm',
                'text-2xl': size === 'md',
                'text-3xl': size === 'lg'
              })}>
                {currentValue.toFixed(1)}
              </div>
              <div className={cn("text-xs opacity-80", {
                'text-xs': size === 'sm',
                'text-sm': size === 'md',
                'text-base': size === 'lg'
              })}>
                {unit}
              </div>
            </div>
          </div>
        </div>
        
        {/* Range Labels */}
        <div className="absolute bottom-4 left-4 text-xs text-muted-foreground">
          {min}
        </div>
        <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
          {max}
        </div>
      </div>
      
      {/* Gauge Label */}
      <div className="mt-4 text-center">
        <h3 className="text-sm font-medium text-foreground">{label}</h3>
      </div>
    </div>
  );
};