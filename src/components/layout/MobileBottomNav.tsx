import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  Users,
  Fuel, 
  Gauge, 
  BarChart3 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const bottomNavItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Vehicles',
    url: '/vehicles',
    icon: Car,
  },
  {
    title: 'Drivers',
    url: '/drivers',
    icon: Users,
  },
  {
    title: 'Fuel Log',
    url: '/fuel-log',
    icon: Fuel,
  },
  {
    title: 'Tank',
    url: '/tank-status',
    icon: Gauge,
  },
];

export function MobileBottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around py-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.url}
              to={item.url}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center py-2 px-3 rounded-lg transition-colors min-w-0 flex-1",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )
              }
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs truncate">{item.title}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}