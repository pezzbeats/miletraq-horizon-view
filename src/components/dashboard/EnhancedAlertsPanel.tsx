import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Bell, 
  X, 
  ChevronRight,
  Filter,
  Zap,
  Fuel,
  Car,
  FileText,
  Calendar,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  type: 'document_expiry' | 'maintenance_due' | 'fuel_low' | 'license_expiry' | 'budget_threshold' | 'efficiency_drop' | 'vehicle_inspection';
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  date: string;
  actionRequired?: boolean;
  vehicleNumber?: string;
  daysUntil?: number;
  data?: any;
  isRead?: boolean;
  category?: string;
}

interface EnhancedAlertsPanelProps {
  alerts: Alert[];
  onViewDetails?: (alert: Alert) => void;
  onMarkAsRead?: (alertId: string) => void;
  onQuickAction?: (alert: Alert, action: string) => void;
  className?: string;
  showFilters?: boolean;
}

const alertTypeIcons = {
  document_expiry: FileText,
  maintenance_due: Car,
  fuel_low: Fuel,
  license_expiry: FileText,
  budget_threshold: DollarSign,
  efficiency_drop: Zap,
  vehicle_inspection: Car
};

const alertTypeColors = {
  document_expiry: 'text-amber-500',
  maintenance_due: 'text-red-500',
  fuel_low: 'text-orange-500',
  license_expiry: 'text-purple-500',
  budget_threshold: 'text-pink-500',
  efficiency_drop: 'text-blue-500',
  vehicle_inspection: 'text-green-500'
};

const severityConfig = {
  critical: {
    color: 'destructive',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-800',
    icon: AlertTriangle
  },
  warning: {
    color: 'warning',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    icon: AlertCircle
  },
  info: {
    color: 'default',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: Bell
  }
};

export const EnhancedAlertsPanel = ({
  alerts,
  onViewDetails,
  onMarkAsRead,
  onQuickAction,
  className,
  showFilters = true
}: EnhancedAlertsPanelProps) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [showRead, setShowRead] = useState(false);

  const filteredAlerts = alerts.filter(alert => {
    if (filter !== 'all' && alert.severity !== filter) return false;
    if (!showRead && alert.isRead) return false;
    return true;
  });

  const unreadCount = alerts.filter(a => !a.isRead).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.isRead).length;

  const getQuickActions = (alert: Alert) => {
    switch (alert.type) {
      case 'maintenance_due':
        return [
          { label: 'Schedule', action: 'schedule' },
          { label: 'Create Ticket', action: 'create_ticket' }
        ];
      case 'fuel_low':
        return [
          { label: 'Record Purchase', action: 'record_purchase' },
          { label: 'View Tank', action: 'view_tank' }
        ];
      case 'document_expiry':
        return [
          { label: 'Upload New', action: 'upload_document' },
          { label: 'Extend Date', action: 'extend_date' }
        ];
      case 'budget_threshold':
        return [
          { label: 'View Budget', action: 'view_budget' },
          { label: 'Request Increase', action: 'request_increase' }
        ];
      default:
        return [{ label: 'View Details', action: 'view_details' }];
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Card className={cn('h-fit', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alerts
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          
          {showFilters && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRead(!showRead)}
                className="h-8 text-xs"
              >
                {showRead ? 'Hide Read' : 'Show Read'}
              </Button>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        {showFilters && (
          <div className="flex items-center gap-1 text-xs">
            {['all', 'critical', 'warning', 'info'].map((type) => (
              <Button
                key={type}
                variant={filter === type ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setFilter(type as any)}
                className="h-7 px-2 text-xs capitalize"
              >
                {type}
                {type === 'critical' && criticalCount > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs h-4">
                    {criticalCount}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-96">
          {filteredAlerts.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No alerts to show</p>
              <p className="text-xs opacity-75">All systems are running smoothly</p>
            </div>
          ) : (
            <div className="space-y-2 p-3">
              {filteredAlerts.map((alert) => {
                const severityConfig_ = severityConfig[alert.severity];
                const AlertIcon = alertTypeIcons[alert.type] || Bell;
                const SeverityIcon = severityConfig_.icon;
                const quickActions = getQuickActions(alert);

                return (
                  <div
                    key={alert.id}
                    className={cn(
                      'relative p-3 rounded-lg border transition-all duration-200 hover:shadow-md',
                      severityConfig_.bgColor,
                      severityConfig_.borderColor,
                      alert.isRead && 'opacity-60',
                      alert.severity === 'critical' && !alert.isRead && 'animate-pulse-glow'
                    )}
                  >
                    {/* Unread indicator */}
                    {!alert.isRead && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
                    )}

                    {/* Alert Header */}
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                        alert.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30' :
                        alert.severity === 'warning' ? 'bg-orange-100 dark:bg-orange-900/30' :
                        'bg-blue-100 dark:bg-blue-900/30'
                      )}>
                        <AlertIcon className={cn('h-4 w-4', alertTypeColors[alert.type])} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{alert.title}</h4>
                          <SeverityIcon className={cn(
                            'h-3 w-3 shrink-0',
                            alert.severity === 'critical' ? 'text-red-500' :
                            alert.severity === 'warning' ? 'text-orange-500' :
                            'text-blue-500'
                          )} />
                        </div>

                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {alert.message}
                        </p>

                        {/* Meta information */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(alert.date)}
                          </div>
                          {alert.vehicleNumber && (
                            <Badge variant="outline" className="text-xs h-5">
                              {alert.vehicleNumber}
                            </Badge>
                          )}
                          {alert.daysUntil !== undefined && (
                            <span className={cn(
                              'font-medium',
                              alert.daysUntil <= 3 ? 'text-red-500' :
                              alert.daysUntil <= 7 ? 'text-orange-500' :
                              'text-blue-500'
                            )}>
                              {alert.daysUntil} days
                            </span>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2">
                          {quickActions.slice(0, 2).map((action, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => onQuickAction?.(alert, action.action)}
                              className="h-6 px-2 text-xs"
                            >
                              {action.label}
                            </Button>
                          ))}
                          
                          {onViewDetails && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewDetails(alert)}
                              className="h-6 w-6 p-0"
                            >
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          )}
                          
                          {onMarkAsRead && !alert.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onMarkAsRead(alert.id)}
                              className="h-6 w-6 p-0 ml-auto"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer Actions */}
        {filteredAlerts.length > 0 && (
          <div className="p-3 border-t bg-muted/20">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Showing {filteredAlerts.length} of {alerts.length} alerts
              </span>
              {unreadCount > 0 && onMarkAsRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => alerts.forEach(a => !a.isRead && onMarkAsRead(a.id))}
                  className="h-7 text-xs"
                >
                  Mark all as read
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};