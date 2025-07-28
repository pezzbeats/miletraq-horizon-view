import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LucideIcon, TrendingUp, TrendingDown, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TrendData {
  value: string;
  direction: 'up' | 'down' | 'neutral';
  period?: string;
  comparison?: string;
}

interface EnhancedKPICardProps {
  title: string;
  value: string | number;
  subValue?: string;
  tertiaryValue?: string;
  icon: LucideIcon;
  trend?: TrendData;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'purple' | 'teal';
  gradient?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'pink' | 'orange' | 'teal';
  className?: string;
  loading?: boolean;
  animateValue?: boolean;
  onClick?: () => void;
  href?: string;
  progress?: number;
  sparkline?: number[];
  actionLabel?: string;
  description?: string;
}

const gradientClasses = {
  primary: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
  success: 'bg-gradient-to-br from-green-500 to-emerald-600 text-white',
  warning: 'bg-gradient-to-br from-orange-500 to-amber-600 text-white',
  error: 'bg-gradient-to-br from-red-500 to-rose-600 text-white',
  info: 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white',
  purple: 'bg-gradient-to-br from-purple-500 to-violet-600 text-white',
  pink: 'bg-gradient-to-br from-pink-500 to-rose-600 text-white',
  orange: 'bg-gradient-to-br from-orange-500 to-red-500 text-white',
  teal: 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white'
};

const cardVariantClasses = {
  default: 'bg-card/95 border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10',
  primary: 'bg-gradient-to-br from-blue-50/80 via-white/90 to-blue-50/60 border-blue-200/50 hover:shadow-lg hover:shadow-blue-500/20',
  success: 'bg-gradient-to-br from-green-50/80 via-white/90 to-emerald-50/60 border-green-200/50 hover:shadow-lg hover:shadow-green-500/20',
  warning: 'bg-gradient-to-br from-orange-50/80 via-white/90 to-amber-50/60 border-orange-200/50 hover:shadow-lg hover:shadow-orange-500/20',
  destructive: 'bg-gradient-to-br from-red-50/80 via-white/90 to-rose-50/60 border-red-200/50 hover:shadow-lg hover:shadow-red-500/20',
  purple: 'bg-gradient-to-br from-purple-50/80 via-white/90 to-violet-50/60 border-purple-200/50 hover:shadow-lg hover:shadow-purple-500/20',
  teal: 'bg-gradient-to-br from-teal-50/80 via-white/90 to-cyan-50/60 border-teal-200/50 hover:shadow-lg hover:shadow-teal-500/20'
};

export const EnhancedKPICard = ({
  title,
  value,
  subValue,
  tertiaryValue,
  icon: Icon,
  trend,
  variant = 'default',
  gradient = 'primary',
  className = '',
  loading = false,
  animateValue = true,
  onClick,
  href,
  progress,
  sparkline,
  actionLabel = 'View Details',
  description
}: EnhancedKPICardProps) => {
  const navigate = useNavigate();
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Animate number counting
  useEffect(() => {
    if (animateValue && typeof value === 'number') {
      const duration = 1500;
      const steps = 60;
      const stepValue = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += stepValue;
        if (current >= value) {
          setAnimatedValue(value);
          clearInterval(timer);
        } else {
          setAnimatedValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setAnimatedValue(typeof value === 'number' ? value : 0);
    }
  }, [value, animateValue]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      navigate(href);
    }
  };

  const displayValue = animateValue && typeof value === 'number' 
    ? animatedValue.toLocaleString() 
    : typeof value === 'number' 
      ? value.toLocaleString() 
      : value;

  const isClickable = Boolean(onClick || href);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3 flex-1">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-8 bg-muted rounded w-20"></div>
              <div className="h-3 bg-muted rounded w-16"></div>
            </div>
            <div className="w-12 h-12 bg-muted rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300 backdrop-blur-sm',
        cardVariantClasses[variant],
        'hover:-translate-y-1 hover:scale-[1.02]',
        isClickable && 'cursor-pointer',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={isClickable ? handleClick : undefined}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Progress bar at the top */}
      {progress !== undefined && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
          <div 
            className={cn(
              'h-full transition-all duration-1000 ease-out',
              gradientClasses[gradient]
            )}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}

      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            {/* Title with optional sparkle effect */}
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              {variant === 'destructive' && (
                <Sparkles className="h-3 w-3 text-red-500 animate-pulse" />
              )}
            </div>

            {/* Main value with animation */}
            <div className="space-y-1">
              <p className="text-3xl font-bold tracking-tight transition-all duration-300 group-hover:scale-105">
                {displayValue}
              </p>
              
              {/* Sub value and tertiary value */}
              <div className="space-y-1">
                {subValue && (
                  <p className="text-sm text-muted-foreground">{subValue}</p>
                )}
                {tertiaryValue && (
                  <p className="text-xs text-muted-foreground opacity-75">{tertiaryValue}</p>
                )}
              </div>
            </div>

            {/* Trend indicator */}
            {trend && (
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={
                    trend.direction === 'up' ? 'default' : 
                    trend.direction === 'down' ? 'destructive' : 
                    'secondary'
                  }
                  className="text-xs flex items-center gap-1"
                >
                  {trend.direction === 'up' && <TrendingUp className="h-3 w-3" />}
                  {trend.direction === 'down' && <TrendingDown className="h-3 w-3" />}
                  {trend.value}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {trend.comparison || 'vs last period'}
                </span>
              </div>
            )}

            {/* Description */}
            {description && (
              <p className="text-xs text-muted-foreground opacity-80">
                {description}
              </p>
            )}

            {/* Action button that appears on hover */}
            {isClickable && (
              <div className={cn(
                'flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-all duration-300',
                isHovered ? 'translate-y-0' : 'translate-y-2'
              )}>
                <span className="font-medium">{actionLabel}</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            )}
          </div>

          {/* Icon container with enhanced styling */}
          <div className="relative">
            <div className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center shadow-lg transition-all duration-300',
              gradientClasses[gradient],
              'group-hover:scale-110 group-hover:rotate-3'
            )}>
              <Icon className="h-6 w-6" />
            </div>
            
            {/* Glow effect for important cards */}
            {variant === 'destructive' && (
              <div className="absolute inset-0 rounded-lg bg-red-500/20 animate-pulse-glow" />
            )}
          </div>
        </div>

        {/* Mini sparkline chart */}
        {sparkline && sparkline.length > 0 && (
          <div className="mt-4 h-8 flex items-end justify-between opacity-60 group-hover:opacity-100 transition-opacity">
            {sparkline.map((point, index) => (
              <div
                key={index}
                className="w-1 bg-primary/40 rounded-full transition-all duration-300 group-hover:bg-primary/60"
                style={{ 
                  height: `${(point / Math.max(...sparkline)) * 100}%`,
                  minHeight: '2px'
                }}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};