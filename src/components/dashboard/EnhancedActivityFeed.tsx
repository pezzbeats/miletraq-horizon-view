import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Activity, 
  Fuel, 
  Wrench, 
  Car, 
  User, 
  FileText, 
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Filter,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'fuel_log' | 'maintenance' | 'vehicle_added' | 'driver_added' | 'document_upload' | 'budget_update' | 'service_ticket' | 'inspection';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
    role?: string;
  };
  metadata?: {
    vehicleNumber?: string;
    amount?: number;
    status?: 'completed' | 'pending' | 'in_progress' | 'cancelled';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    location?: string;
    category?: string;
  };
  actionable?: boolean;
  relatedId?: string;
}

interface EnhancedActivityFeedProps {
  activities: ActivityItem[];
  onActivityClick?: (activity: ActivityItem) => void;
  onQuickAction?: (activity: ActivityItem, action: string) => void;
  className?: string;
  showFilters?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const activityTypeConfig = {
  fuel_log: {
    icon: Fuel,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    label: 'Fuel Log'
  },
  maintenance: {
    icon: Wrench,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    label: 'Maintenance'
  },
  vehicle_added: {
    icon: Car,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    label: 'Vehicle'
  },
  driver_added: {
    icon: User,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    label: 'Driver'
  },
  document_upload: {
    icon: FileText,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
    label: 'Document'
  },
  budget_update: {
    icon: DollarSign,
    color: 'text-pink-500',
    bgColor: 'bg-pink-50 dark:bg-pink-950/30',
    label: 'Budget'
  },
  service_ticket: {
    icon: AlertCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    label: 'Service'
  },
  inspection: {
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    label: 'Inspection'
  }
};

const statusConfig = {
  completed: { color: 'text-green-600', bg: 'bg-green-100', label: 'Completed' },
  pending: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending' },
  in_progress: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'In Progress' },
  cancelled: { color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelled' }
};

const priorityConfig = {
  low: { color: 'text-gray-600', bg: 'bg-gray-100' },
  medium: { color: 'text-blue-600', bg: 'bg-blue-100' },
  high: { color: 'text-orange-600', bg: 'bg-orange-100' },
  critical: { color: 'text-red-600', bg: 'bg-red-100' }
};

export const EnhancedActivityFeed = ({
  activities,
  onActivityClick,
  onQuickAction,
  className,
  showFilters = true,
  autoRefresh = false,
  refreshInterval = 30000
}: EnhancedActivityFeedProps) => {
  const [filter, setFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');

  const filterTypes = ['all', ...Object.keys(activityTypeConfig)];

  const filteredActivities = activities.filter(activity => {
    if (filter !== 'all' && activity.type !== filter) return false;
    
    if (timeFilter !== 'all') {
      const activityDate = new Date(activity.timestamp);
      const now = new Date();
      const daysDiff = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24);
      
      switch (timeFilter) {
        case 'today':
          if (daysDiff > 1) return false;
          break;
        case 'week':
          if (daysDiff > 7) return false;
          break;
        case 'month':
          if (daysDiff > 30) return false;
          break;
      }
    }
    
    return true;
  });

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getQuickActions = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'fuel_log':
        return [
          { label: 'View Log', action: 'view' },
          { label: 'Edit', action: 'edit' }
        ];
      case 'maintenance':
        return [
          { label: 'View Details', action: 'view' },
          { label: 'Update Status', action: 'update_status' }
        ];
      case 'service_ticket':
        return [
          { label: 'View Ticket', action: 'view' },
          { label: 'Update', action: 'update' }
        ];
      default:
        return [{ label: 'View', action: 'view' }];
    }
  };

  return (
    <Card className={cn('h-fit', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
            <Badge variant="outline" className="ml-2">
              {filteredActivities.length}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {autoRefresh && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live
              </div>
            )}
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter Controls */}
        {showFilters && (
          <div className="space-y-2">
            {/* Type Filter */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {filterTypes.map((type) => (
                <Button
                  key={type}
                  variant={filter === type ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(type)}
                  className="h-7 px-2 text-xs shrink-0 capitalize"
                >
                  {type === 'all' ? 'All' : activityTypeConfig[type as keyof typeof activityTypeConfig]?.label || type}
                </Button>
              ))}
            </div>

            {/* Time Filter */}
            <div className="flex items-center gap-1">
              {['all', 'today', 'week', 'month'].map((time) => (
                <Button
                  key={time}
                  variant={timeFilter === time ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeFilter(time as any)}
                  className="h-6 px-2 text-xs capitalize"
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-96">
          {filteredActivities.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
              <p className="text-xs opacity-75">Activity will appear here as it happens</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-4 bottom-4 w-px bg-border" />
              
              {/* Activity items */}
              <div className="space-y-4 p-4">
                {filteredActivities.map((activity, index) => {
                  const config = activityTypeConfig[activity.type];
                  const Icon = config.icon;
                  const quickActions = getQuickActions(activity);

                  return (
                    <div
                      key={activity.id}
                      className={cn(
                        'relative flex gap-4 p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-all duration-200',
                        activity.actionable && 'hover:shadow-md cursor-pointer'
                      )}
                      onClick={() => activity.actionable && onActivityClick?.(activity)}
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-1 top-6 w-2 h-2 bg-primary rounded-full ring-4 ring-background" />

                      {/* Activity icon */}
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                        config.bgColor
                      )}>
                        <Icon className={cn('h-5 w-5', config.color)} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{activity.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {activity.description}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(activity.timestamp)}
                            </span>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          {activity.metadata?.vehicleNumber && (
                            <Badge variant="outline" className="text-xs h-5">
                              <Car className="h-3 w-3 mr-1" />
                              {activity.metadata.vehicleNumber}
                            </Badge>
                          )}
                          
                          {activity.metadata?.status && (
                            <Badge 
                              variant="outline" 
                              className={cn(
                                'text-xs h-5',
                                statusConfig[activity.metadata.status].color
                              )}
                            >
                              {statusConfig[activity.metadata.status].label}
                            </Badge>
                          )}
                          
                          {activity.metadata?.priority && activity.metadata.priority !== 'low' && (
                            <Badge 
                              variant="outline"
                              className={cn(
                                'text-xs h-5',
                                priorityConfig[activity.metadata.priority].color
                              )}
                            >
                              {activity.metadata.priority}
                            </Badge>
                          )}
                          
                          {activity.metadata?.amount && (
                            <span className="text-xs font-medium text-green-600">
                              ₹{activity.metadata.amount.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* User info and actions */}
                        <div className="flex items-center justify-between">
                          {activity.user && (
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={activity.user.avatar} />
                                <AvatarFallback className="text-xs">
                                  {activity.user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-xs">
                                <span className="font-medium">{activity.user.name}</span>
                                {activity.user.role && (
                                  <span className="text-muted-foreground ml-1">
                                    • {activity.user.role}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Quick actions */}
                          <div className="flex items-center gap-1">
                            {quickActions.slice(0, 2).map((action, actionIndex) => (
                              <Button
                                key={actionIndex}
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onQuickAction?.(activity, action.action);
                                }}
                                className="h-6 px-2 text-xs"
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {filteredActivities.length > 0 && (
          <div className="p-3 border-t bg-muted/20">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing {filteredActivities.length} of {activities.length} activities
              </span>
              <Button variant="ghost" size="sm" className="h-6 text-xs">
                View All
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};