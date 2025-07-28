import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Zap, TrendingUp, Settings, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardActions } from '@/hooks/useDashboardActions';

interface QuickAction {
  id: string;
  label: string;
  description?: string;
  icon: any;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  category?: string;
  badge?: string;
  keyboard?: string;
}

interface EnhancedQuickActionsProps {
  className?: string;
  variant?: 'compact' | 'expanded' | 'grid';
  showCategories?: boolean;
  maxActions?: number;
}

export const EnhancedQuickActions = ({
  className,
  variant = 'expanded',
  showCategories = true,
  maxActions = 8
}: EnhancedQuickActionsProps) => {
  const dashboardActions = useDashboardActions();
  const [showAll, setShowAll] = useState(false);

  // Enhanced actions with better categorization
  const enhancedActions: QuickAction[] = [
    ...dashboardActions.map(action => ({
      id: action.label.toLowerCase().replace(/\s+/g, '_'),
      label: action.label,
      icon: action.icon,
      onClick: action.onClick,
      category: 'Fleet Management'
    })),
    {
      id: 'view_analytics',
      label: 'View Analytics',
      description: 'Detailed performance insights',
      icon: TrendingUp,
      onClick: () => window.location.href = '/analytics',
      variant: 'primary' as const,
      category: 'Analytics',
      badge: 'New'
    },
    {
      id: 'quick_setup',
      label: 'Quick Setup',
      description: 'Configure fleet settings',
      icon: Settings,
      onClick: () => window.location.href = '/settings',
      category: 'Configuration'
    }
  ];

  const displayActions = showAll ? enhancedActions : enhancedActions.slice(0, maxActions);

  // Group actions by category
  const actionsByCategory = displayActions.reduce((acc, action) => {
    const category = action.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(action);
    return acc;
  }, {} as Record<string, QuickAction[]>);

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2 overflow-x-auto pb-2', className)}>
        {displayActions.slice(0, 4).map((action) => (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            onClick={action.onClick}
            className="shrink-0 h-9 bg-background/50 backdrop-blur-sm hover:bg-background/80"
          >
            <action.icon className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        ))}
        {enhancedActions.length > 4 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="shrink-0 h-9"
          >
            <Plus className="h-4 w-4" />
            {showAll ? 'Less' : 'More'}
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={cn('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3', className)}>
        {displayActions.map((action) => (
          <Card
            key={action.id}
            className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 bg-card/80 backdrop-blur-sm"
            onClick={action.onClick}
          >
            <CardContent className="p-4 text-center">
              <div className={cn(
                'w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110',
                action.variant === 'primary' ? 'bg-primary/10 text-primary' :
                action.variant === 'success' ? 'bg-green-500/10 text-green-500' :
                action.variant === 'warning' ? 'bg-orange-500/10 text-orange-500' :
                action.variant === 'destructive' ? 'bg-red-500/10 text-red-500' :
                'bg-muted/50 text-muted-foreground'
              )}>
                <action.icon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-sm">{action.label}</h4>
                {action.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {action.description}
                  </p>
                )}
                {action.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {action.badge}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Expanded variant with categories
  return (
    <div className={cn('space-y-6', className)}>
      {showCategories ? (
        Object.entries(actionsByCategory).map(([category, actions]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              {category}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {actions.map((action) => (
                <Card
                  key={action.id}
                  className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm border-2 hover:border-primary/30"
                  onClick={action.onClick}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110',
                        action.variant === 'primary' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' :
                        action.variant === 'success' ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30' :
                        action.variant === 'warning' ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30' :
                        action.variant === 'destructive' ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30' :
                        'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 shadow-sm'
                      )}>
                        <action.icon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                            {action.label}
                          </h4>
                          {action.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {action.badge}
                            </Badge>
                          )}
                        </div>
                        
                        {action.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {action.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          {action.keyboard && (
                            <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                              {action.keyboard}
                            </kbd>
                          )}
                          <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayActions.map((action) => (
            <Card
              key={action.id}
              className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-card/80 backdrop-blur-sm"
              onClick={action.onClick}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    action.variant === 'primary' ? 'bg-primary/10 text-primary' :
                    'bg-muted/50 text-muted-foreground'
                  )}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{action.label}</h4>
                    {action.description && (
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!showAll && enhancedActions.length > maxActions && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowAll(true)}
            className="h-10 bg-background/50 backdrop-blur-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Show {enhancedActions.length - maxActions} more actions
          </Button>
        </div>
      )}
    </div>
  );
};