import { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  title: string;
  url: string;
  icon: any;
  roles?: string[];
  children?: NavItem[];
}

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
              "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors",
              isChildActive 
                ? "bg-primary/10 text-primary" 
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            )}
          >
            <div className="flex items-center">
              <Icon className="mr-3 h-4 w-4" />
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
                        "flex items-center px-3 py-2 text-sm rounded-lg transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent"
                      )
                    }
                  >
                    <ChildIcon className="mr-3 h-4 w-4" />
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
            "flex items-center px-3 py-2 text-sm rounded-lg transition-colors",
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent"
          )
        }
      >
        <Icon className="mr-3 h-4 w-4" />
        {item.title}
      </NavLink>
    );
  };

  const filteredItems = filterItemsByRole(navigationItems);

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 desktop-sidebar overflow-y-auto no-scrollbar">
      <div className="p-4">
        <nav className="space-y-2">
          {filteredItems.map(renderNavItem)}
        </nav>
      </div>
    </aside>
  );
}