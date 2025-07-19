import React from 'react';
import { Clock, Bell, User, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SubsidiarySelector } from '@/components/subsidiary/SubsidiarySelector';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  alertsCount?: number;
  showSearch?: boolean;
  onSearchChange?: (value: string) => void;
}

export function DashboardHeader({
  title,
  subtitle,
  alertsCount = 0,
  showSearch = false,
  onSearchChange,
}: DashboardHeaderProps) {
  const { profile } = useAuth();
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-40">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4">
        {/* Left Section - Title and Subtitle */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground truncate">
                {title}
              </h1>
              <p className="text-sm lg:text-base text-muted-foreground mt-1">
                {subtitle}
              </p>
            </div>
            
            {/* Mobile: Subsidiary Selector */}
            <div className="lg:hidden">
              <SubsidiarySelector />
            </div>
          </div>
        </div>

        {/* Center Section - Search (if enabled) */}
        {showSearch && (
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles, drivers, alerts..."
                className="pl-10 bg-background/50 border-border/50"
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Right Section - Actions and Profile */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Desktop: Subsidiary Selector */}
          <div className="hidden lg:block">
            <SubsidiarySelector />
          </div>

          {/* Time and Date */}
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <div className="text-right">
              <div className="font-medium">{currentTime}</div>
              <div className="text-xs">{currentDate.split(',')[0]}</div>
            </div>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            {alertsCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {alertsCount > 99 ? '99+' : alertsCount}
              </Badge>
            )}
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || 'User'} />
                  <AvatarFallback className="text-xs">
                    {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {profile?.email}
                </p>
                <Badge variant="outline" className="text-xs w-fit mt-1">
                  {profile?.role?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}