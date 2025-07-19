import React from 'react';
import { Building2, Car, Users, AlertTriangle, Eye, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SubsidiaryMetrics {
  totalVehicles: number;
  activeVehicles: number;
  maintenanceVehicles: number;
  inactiveVehicles: number;
  totalDrivers: number;
  alertsCount: number;
  criticalAlerts: number;
  monthlyFuelCost: number;
  efficiency: number;
}

interface ModernSubsidiaryCardProps {
  id: string;
  name: string;
  code: string;
  businessType: string;
  metrics: SubsidiaryMetrics;
  isSelected?: boolean;
  onView: (id: string) => void;
  onSwitchTo: (id: string) => void;
  className?: string;
}

const businessTypeColors = {
  construction: 'from-amber-500 to-orange-600',
  hospitality: 'from-blue-500 to-cyan-600',
  education: 'from-green-500 to-emerald-600',
  other: 'from-purple-500 to-violet-600',
};

const businessTypeIcons = {
  construction: '🏗️',
  hospitality: '🏨',
  education: '🎓',
  other: '🏢',
};

export function ModernSubsidiaryCard({
  id,
  name,
  code,
  businessType,
  metrics,
  isSelected = false,
  onView,
  onSwitchTo,
  className,
}: ModernSubsidiaryCardProps) {
  const getStatusColor = (active: number, total: number) => {
    const percentage = total > 0 ? (active / total) * 100 : 0;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAlertSeverityColor = (critical: number, total: number) => {
    if (critical > 0) return 'bg-red-500';
    if (total > 0) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-xl bg-card border transition-all duration-300",
        "hover:shadow-lg hover:shadow-primary/20 hover:border-primary/50",
        "transform hover:scale-[1.02]",
        isSelected && "ring-2 ring-primary ring-offset-2",
        className
      )}
    >
      {/* Background gradient strip */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
        businessTypeColors[businessType as keyof typeof businessTypeColors] || businessTypeColors.other
      )} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">
                {businessTypeIcons[businessType as keyof typeof businessTypeIcons] || businessTypeIcons.other}
              </span>
              <h3 className="font-semibold text-lg truncate">{name}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {code}
              </Badge>
              <Badge variant="secondary" className="text-xs capitalize">
                {businessType.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          {/* Alert indicator */}
          {metrics.alertsCount > 0 && (
            <div className="relative">
              <div className={cn(
                "w-3 h-3 rounded-full",
                getAlertSeverityColor(metrics.criticalAlerts, metrics.alertsCount)
              )} />
              {metrics.criticalAlerts > 0 && (
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-red-500 animate-ping" />
              )}
            </div>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Vehicles */}
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Vehicles</span>
            </div>
            <div className="text-xl font-bold">{metrics.totalVehicles}</div>
            <div className={cn(
              "text-xs",
              getStatusColor(metrics.activeVehicles, metrics.totalVehicles)
            )}>
              {metrics.activeVehicles} active
            </div>
          </div>

          {/* Drivers */}
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Drivers</span>
            </div>
            <div className="text-xl font-bold">{metrics.totalDrivers}</div>
            <div className="text-xs text-muted-foreground">
              available
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Monthly Fuel Cost</span>
            <span className="font-medium">
              ₹{(metrics.monthlyFuelCost / 1000).toFixed(1)}K
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Avg Efficiency</span>
            <span className="font-medium">
              {metrics.efficiency.toFixed(1)} km/L
            </span>
          </div>
          {metrics.alertsCount > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Active Alerts</span>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                <span className="font-medium text-yellow-700">
                  {metrics.alertsCount}
                </span>
                {metrics.criticalAlerts > 0 && (
                  <span className="text-red-600 font-bold">
                    ({metrics.criticalAlerts} critical)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onView(id)}
          >
            <Eye className="h-3 w-3 mr-1" />
            View Details
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onSwitchTo(id)}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Switch To
          </Button>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}