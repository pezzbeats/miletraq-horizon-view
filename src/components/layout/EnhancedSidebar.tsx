import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  Fuel, 
  ShoppingCart, 
  Gauge, 
  Wrench, 
  Package, 
  Tags, 
  Store, 
  CreditCard, 
  FileText, 
  BarChart3, 
  Settings, 
  UserCog,
  Landmark,
  ChevronDown,
  ChevronRight,
  X,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavItem {
  title: string;
  url: string;
  icon: any;
  roles?: string[];
  children?: NavItem[];
}

const navAccentClasses: Record<string, string> = {
  Dashboard: 'text-sky-600 dark:text-sky-400',
  'Fleet Management': 'text-indigo-600 dark:text-indigo-400',
  Vehicles: 'text-indigo-600 dark:text-indigo-400',
  Drivers: 'text-blue-600 dark:text-blue-400',
  Documents: 'text-cyan-600 dark:text-cyan-400',
  Odometer: 'text-violet-600 dark:text-violet-400',
  'Fuel Management': 'text-emerald-600 dark:text-emerald-400',
  'Fuel Log': 'text-emerald-600 dark:text-emerald-400',
  'Tank Refills': 'text-teal-600 dark:text-teal-400',
  'Tank Status': 'text-green-600 dark:text-green-400',
  Maintenance: 'text-amber-600 dark:text-amber-400',
  'Maintenance Log': 'text-amber-600 dark:text-amber-400',
  'Service Tickets': 'text-orange-600 dark:text-orange-400',
  'Parts Master': 'text-yellow-600 dark:text-yellow-400',
  Categories: 'text-lime-600 dark:text-lime-400',
  Vendors: 'text-rose-600 dark:text-rose-400',
  Budget: 'text-violet-600 dark:text-violet-400',
  Analytics: 'text-cyan-600 dark:text-cyan-400',
  Subsidiaries: 'text-orange-600 dark:text-orange-400',
  Users: 'text-blue-600 dark:text-blue-400',
  Settings: 'text-slate-600 dark:text-slate-300',
};

const getNavAccent = (title: string) =>
  navAccentClasses[title] || 'text-primary';

const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Fleet Management',
    url: '/fleet',
    icon: Car,
    children: [
      { title: 'Vehicles', url: '/vehicles', icon: Car },
      { title: 'Drivers', url: '/drivers', icon: Users },
      { title: 'Documents', url: '/documents', icon: FileText },
      { title: 'Odometer', url: '/odometer', icon: Gauge },
    ],
  },
  {
    title: 'Fuel Management',
    url: '/fuel',
    icon: Fuel,
    children: [
      { title: 'Fuel Log', url: '/fuel-log', icon: Fuel },
      { title: 'Tank Refills', url: '/fuel-purchases', icon: ShoppingCart },
      { title: 'Tank Status', url: '/tank-status', icon: Landmark },
    ],
  },
  {
    title: 'Maintenance',
    url: '/maintenance',
    icon: Wrench,
    children: [
      { title: 'Maintenance Log', url: '/maintenance', icon: Wrench },
      { title: 'Service Tickets', url: '/service-tickets', icon: FileText },
      { title: 'Parts Master', url: '/parts-master', icon: Package },
      { title: 'Categories', url: '/categories-master', icon: Tags },
    ],
  },
  {
    title: 'Vendors',
    url: '/vendors',
    icon: Store,
  },
  {
    title: 'Budget',
    url: '/budget',
    icon: CreditCard,
  },
  {
    title: 'Analytics',
    url: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'Subsidiaries',
    url: '/subsidiaries',
    icon: Landmark,
    roles: ['admin'],
  },
  {
    title: 'Users',
    url: '/users',
    icon: UserCog,
    roles: ['admin'],
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
];

// Mobile Sidebar Component
export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { hasPermission } = useAuth();
  const [openGroups, setOpenGroups] = useState<string[]>(['/fleet', '/fuel', '/maintenance']);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleGroup = (url: string) => {
    setOpenGroups(prev => 
      prev.includes(url) 
        ? prev.filter(g => g !== url)
        : [...prev, url]
    );
  };

  const isActive = (url: string) => location.pathname === url;
  const isGroupActive = (children: NavItem[]) => 
    children.some(child => location.pathname === child.url);

  const filterItemsByRole = (items: NavItem[]): NavItem[] => {
    return items.filter(item => {
      if (item.roles && item.roles.length > 0) {
        return item.roles.some(role => hasPermission(role as any));
      }
      return true;
    });
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isGroupOpen = openGroups.includes(item.url);
    const isItemActive = isActive(item.url);
    const isChildActive = hasChildren && isGroupActive(item.children);

    if (hasChildren) {
      return (
        <div key={item.title}>
          <button
            onClick={() => toggleGroup(item.url)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 text-sm rounded-lg transition-all duration-200 mobile-touch-target",
              isChildActive 
                ? "bg-primary/15 text-primary border border-primary/20 shadow-sm" 
                : "text-foreground hover:bg-accent/50 hover:shadow-sm"
            )}
          >
            <div className="flex items-center">
              <Icon className={cn("mr-3 h-5 w-5", getNavAccent(item.title))} />
              <span className="font-medium">{item.title}</span>
            </div>
            {isGroupOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {isGroupOpen && (
            <div className="ml-4 mt-1 space-y-1 pb-2">
              {item.children.map((child) => {
                const ChildIcon = child.icon;
                return (
                  <NavLink
                    key={child.url}
                    to={child.url}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200 mobile-touch-target",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-foreground hover:bg-accent/50 hover:shadow-sm"
                      )
                    }
                  >
                    <ChildIcon className={cn("mr-3 h-4 w-4", getNavAccent(child.title))} />
                    <span className="font-medium">{child.title}</span>
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.url}
        to={item.url}
        onClick={() => setIsOpen(false)}
        className={({ isActive }) =>
          cn(
            "flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200 mobile-touch-target",
            isActive
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-foreground hover:bg-accent/50 hover:shadow-sm"
          )
        }
      >
        <Icon className={cn("mr-3 h-5 w-5", getNavAccent(item.title))} />
        <span className="font-medium">{item.title}</span>
      </NavLink>
    );
  };

  const filteredItems = filterItemsByRole(navigationItems);

  return (
    <>
      {/* Menu Button */}
      <Button
        variant="ghost"
        size="icon-lg"
        onClick={() => setIsOpen(true)}
        className="lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-screen w-80 z-50 bg-background/95 backdrop-blur-xl border-r border-border shadow-2xl transition-transform duration-300 lg:hidden flex flex-col safe-area-top",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex-1 flex flex-col min-h-0 h-full">
          {/* Header */}
          <div className="flex-shrink-0 p-4 border-b border-border bg-background/98">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center">
                  <Car className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-xl font-bold gradient-text">MileTraq</h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="mobile-touch-target"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation - Scrollable Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar bg-background/90">
            <div className="p-4">
              <nav className="space-y-2 pb-4">
                {filteredItems.map(renderNavItem)}
              </nav>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// Desktop Sidebar Component (Enhanced)
export function DesktopSidebar() {
  const location = useLocation();
  const { hasPermission } = useAuth();
  const [openGroups, setOpenGroups] = useState<string[]>(['/fleet', '/fuel', '/maintenance']);

  const toggleGroup = (url: string) => {
    setOpenGroups(prev => 
      prev.includes(url) 
        ? prev.filter(g => g !== url)
        : [...prev, url]
    );
  };

  const isActive = (url: string) => location.pathname === url;
  const isGroupActive = (children: NavItem[]) => 
    children.some(child => location.pathname === child.url);

  const filterItemsByRole = (items: NavItem[]): NavItem[] => {
    return items.filter(item => {
      if (item.roles && item.roles.length > 0) {
        return item.roles.some(role => hasPermission(role as any));
      }
      return true;
    });
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isGroupOpen = openGroups.includes(item.url);
    const isItemActive = isActive(item.url);
    const isChildActive = hasChildren && isGroupActive(item.children);

    if (hasChildren) {
      return (
        <div key={item.title}>
          <button
            onClick={() => toggleGroup(item.url)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200",
              isChildActive 
                ? "bg-primary/15 text-primary border border-primary/20 shadow-sm dark:bg-primary/25 dark:border-primary/30" 
                : "text-sidebar-foreground hover:bg-accent/50 hover:shadow-sm dark:hover:bg-accent/30"
            )}
          >
            <div className="flex items-center">
              <Icon className={cn("mr-3 h-4 w-4", getNavAccent(item.title))} />
              {item.title}
            </div>
            {isGroupOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {isGroupOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map((child) => {
                const ChildIcon = child.icon;
                return (
                  <NavLink
                    key={child.url}
                    to={child.url}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-sidebar-foreground hover:bg-accent/50 hover:shadow-sm dark:hover:bg-accent/30"
                      )
                    }
                  >
                    <ChildIcon className={cn("mr-3 h-4 w-4", getNavAccent(child.title))} />
                    {child.title}
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.url}
        to={item.url}
        className={({ isActive }) =>
          cn(
            "flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200",
            isActive
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-sidebar-foreground hover:bg-accent/50 hover:shadow-sm dark:hover:bg-accent/30"
          )
        }
      >
        <Icon className={cn("mr-3 h-4 w-4", getNavAccent(item.title))} />
        {item.title}
      </NavLink>
    );
  };

  const filteredItems = filterItemsByRole(navigationItems);

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-card/92 backdrop-blur-xl border-r border-border/60 shadow-sm overflow-y-auto custom-scrollbar transition-colors duration-300">
      <div className="p-4">
        <nav className="space-y-2">
          {filteredItems.map(renderNavItem)}
        </nav>
      </div>
    </aside>
  );
}