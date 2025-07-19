import React from 'react';
import { cn } from '@/lib/utils';

interface StatusLightProps {
  status: 'active' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
  label?: string;
}

export const StatusLight: React.FC<StatusLightProps> = ({
  status,
  size = 'md',
  animated = true,
  className,
  label
}) => {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const statusColors = {
    active: 'bg-green-500 shadow-[0_0_10px_rgb(34,197,94)]',
    warning: 'bg-yellow-500 shadow-[0_0_10px_rgb(234,179,8)]',
    danger: 'bg-red-500 shadow-[0_0_10px_rgb(239,68,68)]',
    info: 'bg-blue-500 shadow-[0_0_10px_rgb(59,130,246)]'
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div
        className={cn(
          "rounded-full",
          sizes[size],
          statusColors[status],
          animated && "animate-led-pulse"
        )}
      />
      {label && (
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
};