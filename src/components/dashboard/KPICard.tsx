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
    default: 'border-white/30 bg-gradient-to-br from-white/80 via-white/60 to-white/80 backdrop-blur-sm shadow-lg shadow-blue-500/10',
    primary: 'border-blue-200/50 bg-gradient-to-br from-blue-50/80 via-white/70 to-blue-50/60 backdrop-blur-sm shadow-lg shadow-blue-500/20',
    success: 'border-green-200/50 bg-gradient-to-br from-green-50/80 via-white/70 to-emerald-50/60 backdrop-blur-sm shadow-lg shadow-green-500/20',
    warning: 'border-orange-200/50 bg-gradient-to-br from-orange-50/80 via-white/70 to-amber-50/60 backdrop-blur-sm shadow-lg shadow-orange-500/20',
    destructive: 'border-red-200/50 bg-gradient-to-br from-red-50/80 via-white/70 to-rose-50/60 backdrop-blur-sm shadow-lg shadow-red-500/20'
  };

  const iconVariantClasses = {
    default: 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 shadow-sm',
    primary: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30',
    success: 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/30',
    warning: 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/30',
    destructive: 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md shadow-red-500/30'
  };

  return (
    <Card className={`${variantClasses[variant]} hover:shadow-xl hover:shadow-blue-500/15 hover:-translate-y-1 transition-all duration-300 ${className}`}>
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