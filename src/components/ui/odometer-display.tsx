import React from 'react';
import { cn } from '@/lib/utils';

interface OdometerDisplayProps {
  value: number;
  label?: string;
  className?: string;
  digits?: number;
  animated?: boolean;
}

export const OdometerDisplay: React.FC<OdometerDisplayProps> = ({
  value,
  label,
  className,
  digits = 6,
  animated = true
}) => {
  const formatValue = (num: number, digitCount: number): string => {
    return num.toString().padStart(digitCount, '0');
  };

  const valueString = formatValue(value, digits);

  return (
    <div className={cn("odometer-card", className)}>
      <div className="text-center space-y-2">
        {label && (
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </div>
        )}
        <div className={cn(
          "odometer-display font-mono text-4xl md:text-5xl font-bold tracking-wider",
          animated && "transition-all duration-500 ease-out"
        )}>
          {valueString.split('').map((digit, index) => (
            <span
              key={index}
              className={cn(
                "inline-block w-8 md:w-10 text-center",
                animated && "animate-engine-start"
              )}
              style={{
                animationDelay: animated ? `${index * 100}ms` : '0ms'
              }}
            >
              {digit}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};