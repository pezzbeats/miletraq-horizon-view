import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  className?: string;
}

export const KPICard = ({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  variant = 'default',
  className = ''
}: KPICardProps) => {
  const variantClasses = {
    default: 'border-border',
    primary: 'border-primary/20 bg-primary/5',
    success: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950',
    warning: 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950',
    destructive: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
  };

  const iconVariantClasses = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary text-primary-foreground',
    success: 'bg-green-500 text-white',
    warning: 'bg-orange-500 text-white',
    destructive: 'bg-red-500 text-white'
  };

  return (
    <Card className={`${variantClasses[variant]} hover:shadow-md transition-all duration-200 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <div className="space-y-1">
              <p className="text-3xl font-bold tracking-tight">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {subValue && (
                <p className="text-sm text-muted-foreground">{subValue}</p>
              )}
            </div>
            {trend && (
              <div className="flex items-center space-x-1">
                <Badge 
                  variant={trend.direction === 'up' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {trend.direction === 'up' ? '↗' : '↘'} {trend.value}
                </Badge>
                <span className="text-xs text-muted-foreground">vs last period</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconVariantClasses[variant]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};