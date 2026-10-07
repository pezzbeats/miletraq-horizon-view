import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Fuel,
  Wrench,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const bottomNavItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    accent: 'sky',
  },
  {
    title: 'Fleet',
    url: '/vehicles',
    icon: Car,
    accent: 'indigo',
  },
  {
    title: 'Fuel',
    url: '/fuel-log',
    icon: Fuel,
    accent: 'emerald',
  },
  {
    title: 'Maintenance',
    url: '/maintenance',
    icon: Wrench,
    accent: 'amber',
  },
  {
    title: 'Profile',
    url: '/users',
    icon: User,
    accent: 'violet',
  },
] as const;

const accentStyles = {
  sky: {
    active: 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-300 dark:bg-sky-500/10 dark:border-sky-500/20',
    icon: 'text-sky-600 dark:text-sky-400',
  },
  indigo: {
    active: 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-300 dark:bg-indigo-500/10 dark:border-indigo-500/20',
    icon: 'text-indigo-600 dark:text-indigo-400',
  },
  emerald: {
    active: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/20',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    active: 'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/20',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  violet: {
    active: 'text-violet-700 bg-violet-50 border-violet-200 dark:text-violet-300 dark:bg-violet-500/10 dark:border-violet-500/20',
    icon: 'text-violet-600 dark:text-violet-400',
  },
} as const;

export function MobileBottomNav() {
  const { profile } = useAuth();

  const getFilteredNavItems = () => {
    if (!profile) return bottomNavItems;

    switch (profile.role) {
      case 'fuel_manager':
        return bottomNavItems.filter((item) =>
          ['/dashboard', '/fuel-log', '/users'].includes(item.url)
        );
      case 'viewer':
        return bottomNavItems.filter((item) =>
          ['/dashboard', '/vehicles', '/fuel-log', '/maintenance'].includes(item.url)
        );
      default:
        return bottomNavItems;
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/70 bg-card/95 backdrop-blur-xl safe-area-bottom shadow-[0_-10px_30px_rgba(15,23,42,0.06)]">
      <div className="mx-auto flex max-w-screen-xl items-center justify-around gap-1 px-2 py-2">
        {getFilteredNavItems().map((item) => {
          const Icon = item.icon;
          const styles = accentStyles[item.accent];

          return (
            <NavLink
              key={item.url}
              to={item.url}
              className={({ isActive }) =>
                cn(
                  'relative flex min-w-0 flex-1 flex-col items-center justify-center rounded-xl border border-transparent px-2 py-2.5 transition-all duration-200 large-touch-target active:scale-[0.98]',
                  isActive
                    ? styles.active
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'mb-1 h-5 w-5 transition-transform duration-200',
                      isActive ? 'scale-110' : styles.icon
                    )}
                  />
                  <span className="max-w-full truncate text-[11px] font-semibold leading-tight">
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
