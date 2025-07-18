import { AlertTriangle, Clock, FileText, Fuel, Gauge, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Alert {
  id: string;
  type: 'document_expiry' | 'maintenance_due' | 'fuel_low' | 'license_expiry' | 'budget_threshold' | 'efficiency_drop';
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  date: string;
  actionRequired?: boolean;
  vehicleNumber?: string;
  daysUntil?: number;
}

interface AlertsPanelProps {
  alerts: Alert[];
  onMarkAsRead?: (alertId: string) => void;
  onViewDetails?: (alert: Alert) => void;
  className?: string;
}

export const AlertsPanel = ({ 
  alerts, 
  onMarkAsRead, 
  onViewDetails,
  className = '' 
}: AlertsPanelProps) => {
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'document_expiry':
      case 'license_expiry':
        return FileText;
      case 'maintenance_due':
        return Gauge;
      case 'fuel_low':
        return Fuel;
      case 'budget_threshold':
        return AlertTriangle;
      case 'efficiency_drop':
        return Users;
      default:
        return AlertTriangle;
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-orange-500 text-white';
      case 'info':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getSeverityDotColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-orange-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  const warningAlerts = alerts.filter(alert => alert.severity === 'warning');
  const infoAlerts = alerts.filter(alert => alert.severity === 'info');

  return (
    <Card className={`h-fit ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Alerts & Notifications
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {alerts.length} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="space-y-1 p-4 pt-0">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No alerts at this time</p>
                <p className="text-xs">Your fleet is running smoothly</p>
              </div>
            ) : (
              <>
                {/* Critical Alerts */}
                {criticalAlerts.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      Critical ({criticalAlerts.length})
                    </div>
                    {criticalAlerts.map(alert => (
                      <AlertItem 
                        key={alert.id} 
                        alert={alert} 
                        onMarkAsRead={onMarkAsRead}
                        onViewDetails={onViewDetails}
                      />
                    ))}
                  </div>
                )}

                {/* Warning Alerts */}
                {warningAlerts.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-orange-600">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      Warning ({warningAlerts.length})
                    </div>
                    {warningAlerts.map(alert => (
                      <AlertItem 
                        key={alert.id} 
                        alert={alert} 
                        onMarkAsRead={onMarkAsRead}
                        onViewDetails={onViewDetails}
                      />
                    ))}
                  </div>
                )}

                {/* Info Alerts */}
                {infoAlerts.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      Information ({infoAlerts.length})
                    </div>
                    {infoAlerts.map(alert => (
                      <AlertItem 
                        key={alert.id} 
                        alert={alert} 
                        onMarkAsRead={onMarkAsRead}
                        onViewDetails={onViewDetails}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const AlertItem = ({ 
  alert, 
  onMarkAsRead, 
  onViewDetails 
}: { 
  alert: Alert; 
  onMarkAsRead?: (alertId: string) => void;
  onViewDetails?: (alert: Alert) => void;
}) => {
  const Icon = getAlertIcon(alert.type);
  
  return (
    <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          alert.severity === 'critical' ? 'bg-red-100 text-red-600' :
          alert.severity === 'warning' ? 'bg-orange-100 text-orange-600' :
          'bg-blue-100 text-blue-600'
        }`}>
          <Icon className="h-4 w-4" />
        </div>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{alert.title}</p>
            {alert.daysUntil !== undefined && (
              <Badge variant="outline" className="text-xs">
                {alert.daysUntil > 0 ? `${alert.daysUntil} days` : 'Overdue'}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{alert.message}</p>
          {alert.vehicleNumber && (
            <p className="text-xs font-mono text-muted-foreground">
              Vehicle: {alert.vehicleNumber}
            </p>
          )}
          
          <div className="flex items-center gap-2 pt-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {new Date(alert.date).toLocaleDateString()}
            </div>
            {alert.actionRequired && (
              <Badge variant="destructive" className="text-xs">Action Required</Badge>
            )}
          </div>
        </div>
      </div>
      
      {(onMarkAsRead || onViewDetails) && (
        <div className="flex gap-2 mt-2 pt-2 border-t">
          {onViewDetails && (
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-7"
              onClick={() => onViewDetails(alert)}
            >
              View Details
            </Button>
          )}
          {onMarkAsRead && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-xs h-7"
              onClick={() => onMarkAsRead(alert.id)}
            >
              Mark as Read
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const getAlertIcon = (type: Alert['type']) => {
  switch (type) {
    case 'document_expiry':
    case 'license_expiry':
      return FileText;
    case 'maintenance_due':
      return Gauge;
    case 'fuel_low':
      return Fuel;
    case 'budget_threshold':
      return AlertTriangle;
    case 'efficiency_drop':
      return Users;
    default:
      return AlertTriangle;
  }
};