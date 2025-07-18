import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Activity, Clock, User, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'fuel_entry' | 'maintenance' | 'document_upload' | 'vehicle_added' | 'driver_added' | 'budget_update';
  title: string;
  description: string;
  user: string;
  timestamp: string;
  metadata?: {
    vehicleNumber?: string;
    amount?: number;
    documentType?: string;
  };
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  className?: string;
}

export const ActivityFeed = ({ activities, className = '' }: ActivityFeedProps) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'fuel_entry':
        return '⛽';
      case 'maintenance':
        return '🔧';
      case 'document_upload':
        return '📄';
      case 'vehicle_added':
        return '🚗';
      case 'driver_added':
        return '👤';
      case 'budget_update':
        return '💰';
      default:
        return '📝';
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'fuel_entry':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'maintenance':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'document_upload':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'vehicle_added':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'driver_added':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'budget_update':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className={`h-fit ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground px-4">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
              <p className="text-xs">Activity will appear here</p>
            </div>
          ) : (
            <div className="space-y-0">
              {activities.map((activity, index) => (
                <div key={activity.id}>
                  <div className="p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <Badge 
                        variant="outline" 
                        className={`${getActivityColor(activity.type)} text-lg p-1 min-w-[2rem] h-8 flex items-center justify-center`}
                      >
                        {getActivityIcon(activity.type)}
                      </Badge>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {activity.user}
                          </div>
                          {activity.metadata?.vehicleNumber && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {activity.metadata.vehicleNumber}
                            </div>
                          )}
                          {activity.metadata?.amount && (
                            <Badge variant="outline" className="text-xs">
                              ₹{activity.metadata.amount.toLocaleString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < activities.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};