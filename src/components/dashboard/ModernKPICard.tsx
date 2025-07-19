import React, { useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendData {
  value: number;
  direction: 'up' | 'down' | 'neutral';
  period?: string;
  comparison?: string;
}

interface ModernKPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  tertiary?: string;
  icon: LucideIcon;
  gradient: 'blue' | 'green' | 'orange' | 'purple' | 'teal' | 'red' | 'yellow';
  trend?: TrendData;
  progress?: number;
  loading?: boolean;
  error?: string | null;
  onClick?: () => void;
  className?: string;
  animateValue?: boolean;
}

const gradientStyles = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  orange: 'from-orange-500 to-orange-600',
  purple: 'from-purple-500 to-purple-600',
  teal: 'from-teal-500 to-teal-600',
  red: 'from-red-500 to-red-600',
  yellow: 'from-yellow-500 to-yellow-600',
};

const iconBackgroundStyles = {
  blue: 'bg-blue-400/20',
  green: 'bg-green-400/20',
  orange: 'bg-orange-400/20',
  purple: 'bg-purple-400/20',
  teal: 'bg-teal-400/20',
  red: 'bg-red-400/20',
  yellow: 'bg-yellow-400/20',
};

export function ModernKPICard({
  title,
  value,
  subtitle,
  tertiary,
  icon: Icon,
  gradient,
  trend,
  progress,
  loading = false,
  error = null,
  onClick,
  className,
  animateValue = true,
}: ModernKPICardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    if (animateValue && typeof value === 'number') {
      const duration = 1000; // 1 second
      const steps = 30;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }
  }, [value, animateValue]);

  const formatValue = (val: string | number) => {
    if (typeof val === 'number' && animateValue) {
      return displayValue.toLocaleString();
    }
    return val.toString();
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-green-300';
      case 'down': return 'text-red-300';
      default: return 'text-white/60';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  if (loading) {
    return (
      <div className={cn(
        "relative overflow-hidden rounded-xl h-[140px] md:h-[140px] sm:h-[120px]",
        "bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800",
        "animate-pulse",
        className
      )}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(
        "relative overflow-hidden rounded-xl h-[140px] md:h-[140px] sm:h-[120px]",
        "bg-gradient-to-br from-red-500 to-red-600",
        "p-4 flex items-center justify-center text-white",
        className
      )}>
        <div className="text-center">
          <div className="text-sm font-medium">Error loading data</div>
          <div className="text-xs opacity-80 mt-1">Tap to retry</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-xl h-[140px] md:h-[140px] sm:h-[120px]",
        "bg-gradient-to-br backdrop-blur-sm border border-white/10",
        gradientStyles[gradient],
        "transition-all duration-300 ease-out",
        "hover:scale-[1.02] hover:shadow-2xl hover:shadow-current/25",
        onClick && "cursor-pointer",
        "transform-gpu",
        isVisible ? "animate-fade-in" : "opacity-0",
        className
      )}
      onClick={onClick}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
      
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative p-4 h-full flex flex-col justify-between text-white">
        {/* Header with icon */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white/90 truncate">
              {title}
            </h3>
          </div>
          <div className={cn(
            "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ml-3",
            iconBackgroundStyles[gradient],
            "group-hover:scale-110 transition-transform duration-300"
          )}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Main value */}
        <div className="flex-1 flex items-center">
          <div className="min-w-0">
            <div className="text-3xl md:text-4xl font-bold text-white leading-none">
              {formatValue(value)}
            </div>
            {subtitle && (
              <div className="text-sm text-white/80 mt-1 font-medium">
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {/* Footer with trend and tertiary info */}
        <div className="flex items-end justify-between">
          <div className="flex-1 min-w-0">
            {tertiary && (
              <div className="text-xs text-white/60 truncate">
                {tertiary}
              </div>
            )}
          </div>
          
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              getTrendColor(trend.direction)
            )}>
              <span className="text-sm">
                {getTrendIcon(trend.direction)}
              </span>
              <span>
                {Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0">
            <div className="h-1 bg-white/20">
              <div 
                className="h-full bg-white/60 transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Micro-interaction pulse for critical alerts */}
      {gradient === 'red' && typeof value === 'number' && value > 0 && (
        <div className="absolute inset-0 rounded-xl animate-pulse border-2 border-red-300/50" />
      )}
    </div>
  );
}