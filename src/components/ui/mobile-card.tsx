
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { MoreVertical, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileCardProps {
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  icon?: LucideIcon;
  children?: React.ReactNode;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline';
  }>;
  onCardClick?: () => void;
  className?: string;
}

export function MobileCard({
  title,
  subtitle,
  badge,
  icon: Icon,
  children,
  actions,
  onCardClick,
  className
}: MobileCardProps) {
  return (
    <Card 
      className={cn(
        "mobile-card hover:shadow-md transition-all duration-200 active:scale-98",
        onCardClick && "cursor-pointer",
        className
      )}
      onClick={onCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {Icon && (
              <div className="flex-shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold truncate">
                {title}
              </CardTitle>
              {subtitle && (
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {badge && (
              <Badge variant={badge.variant || 'default'} className="text-xs">
                {badge.text}
              </Badge>
            )}
            {actions && actions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 touch-target"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle actions dropdown
                }}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      {children && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

interface MobileKPICardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  className?: string;
}

export function MobileKPICard({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  variant = 'default',
  className
}: MobileKPICardProps) {
  const variantClasses = {
    default: 'border-border bg-card',
    primary: 'border-blue-200 bg-blue-50 dark:border-blue-400/30 dark:bg-blue-950/50',
    success: 'border-green-200 bg-green-50 dark:border-green-400/30 dark:bg-green-950/50',
    warning: 'border-orange-200 bg-orange-50 dark:border-orange-400/30 dark:bg-orange-950/50',
    destructive: 'border-red-200 bg-red-50 dark:border-red-400/30 dark:bg-red-950/50'
  };

  const iconColors = {
    default: 'text-foreground',
    primary: 'text-blue-700 dark:text-blue-300',
    success: 'text-green-700 dark:text-green-300',
    warning: 'text-orange-700 dark:text-orange-300',
    destructive: 'text-red-700 dark:text-red-300'
  };

  return (
    <Card className={cn(
      "mobile-card h-24 flex items-center p-4",
      variantClasses[variant],
      className
    )}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-3">
          <div className={cn(
            "p-2 rounded-lg border",
            variant === 'default' && "bg-background border-border",
            variant === 'primary' && "bg-blue-100 dark:bg-blue-900/50 border-blue-200 dark:border-blue-700",
            variant === 'success' && "bg-green-100 dark:bg-green-900/50 border-green-200 dark:border-green-700",
            variant === 'warning' && "bg-orange-100 dark:bg-orange-900/50 border-orange-200 dark:border-orange-700",
            variant === 'destructive' && "bg-red-100 dark:bg-red-900/50 border-red-200 dark:border-red-700"
          )}>
            <Icon className={cn("h-5 w-5", iconColors[variant])} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground opacity-90">{title}</p>
            <p className="text-xl font-bold text-foreground">{value}</p>
            {subValue && (
              <p className="text-xs font-medium text-foreground opacity-75">{subValue}</p>
            )}
          </div>
        </div>
        {trend && (
          <div className={cn(
            "text-xs font-bold px-3 py-1.5 rounded-full border",
            trend.isPositive 
              ? "text-green-800 bg-green-100 border-green-200 dark:text-green-200 dark:bg-green-900/50 dark:border-green-700"
              : "text-red-800 bg-red-100 border-red-200 dark:text-red-200 dark:bg-red-900/50 dark:border-red-700"
          )}>
            {trend.isPositive ? '+' : ''}{trend.value}
          </div>
        )}
      </div>
    </Card>
  );
}
