
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  Fuel, 
  Wrench,
  User,
  Badge as BadgeIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

const bottomNavItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Fleet',
    url: '/vehicles',
    icon: Car,
  },
  {
    title: 'Fuel',
    url: '/fuel-log',
    icon: Fuel,
  },
  {
    title: 'Maintenance',
    url: '/maintenance',
    icon: Wrench,
  },
  {
    title: 'Profile',
    url: '/users',
    icon: User,
  },
];

interface NotificationCounts {
  dashboard: number;
  fleet: number;
  fuel: number;
  maintenance: number;
  profile: number;
}

export function MobileBottomNav() {
  const { profile } = useAuth();
  
  // Mock notification counts - in real app, fetch from API
  const notifications: NotificationCounts = {
    dashboard: 3,
    fleet: 0,
    fuel: 1,
    maintenance: 2,
    profile: 0
  };

  const getNotificationCount = (url: string): number => {
    switch (url) {
      case '/dashboard': return notifications.dashboard;
      case '/vehicles': return notifications.fleet;
      case '/fuel-log': return notifications.fuel;
      case '/maintenance': return notifications.maintenance;
      case '/users': return notifications.profile;
      default: return 0;
    }
  };

  // Filter navigation items based on user role
  const getFilteredNavItems = () => {
    if (!profile) return bottomNavItems;
    
    switch (profile.role) {
      case 'fuel_manager':
        return bottomNavItems.filter(item => 
          ['/dashboard', '/fuel-log', '/tank-status', '/users'].includes(item.url)
        );
      case 'viewer':
        return bottomNavItems.filter(item => 
          ['/dashboard', '/vehicles', '/fuel-log', '/maintenance'].includes(item.url)
        ).map(item => item.url === '/users' ? { ...item, url: '/profile' } : item);
      default:
        return bottomNavItems;
    }
  };

  const filteredItems = getFilteredNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-inset">
      <div className="flex items-center justify-around py-1 px-2 max-w-screen-xl mx-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const notificationCount = getNotificationCount(item.url);
          
          return (
            <NavLink
              key={item.url}
              to={item.url}
              className={({ isActive }) =>
                cn(
                  "relative flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 min-w-0 flex-1 touch-target",
                  isActive
                    ? "text-primary bg-primary/10 scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={cn(
                      "h-5 w-5 mb-1 transition-transform duration-200",
                      isActive && "animate-bounce-gentle"
                    )} />
                    {notificationCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center min-w-4 animate-pulse-glow"
                      >
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </Badge>
                    )}
                  </div>
                  <span className={cn(
                    "text-xs truncate font-medium transition-all duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {item.title}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
