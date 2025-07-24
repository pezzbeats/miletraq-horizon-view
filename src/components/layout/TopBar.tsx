
import { Bell, Moon, Sun, Sunset, LogOut, User, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { HeaderSubsidiarySelector } from './HeaderSubsidiarySelector';

export function TopBar() {
  const { user, profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  const themeIcons = {
    light: Sun,
    dark: Moon,
    auto: Sunset,
  };

  const ThemeIcon = themeIcons[theme];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 backdrop-blur-md border-b border-border/30 bg-card/90 shadow-lg transition-colors duration-300 safe-area-top">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Logo & Company */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center">
              <Building className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold gradient-text hidden sm:block">MileTraq</h1>
          </div>
          
          {/* Subsidiary Selector - Desktop */}
          <div className="hidden lg:block">
            <HeaderSubsidiarySelector />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          {/* Subsidiary Selector - Mobile */}
          <div className="lg:hidden">
            <HeaderSubsidiarySelector />
          </div>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon-lg" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse-glow"></span>
          </Button>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-lg">
                <ThemeIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="h-4 w-4 mr-2" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('auto')}>
                <Sunset className="h-4 w-4 mr-2" />
                Auto (Time-based)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full mobile-touch-target">
                <Avatar className="h-8 w-8 md:h-9 md:w-9">
                  <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{profile?.full_name || 'User'}</p>
                    <Badge variant="outline" className="text-xs">
                      {profile?.role?.replace('_', ' ').toUpperCase() || 'VIEWER'}
                    </Badge>
                  </div>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                  {profile?.is_super_admin && (
                    <Badge variant="default" className="text-xs w-fit">
                      SUPER ADMIN
                    </Badge>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
