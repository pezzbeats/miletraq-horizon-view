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
import { useSubsidiary } from '@/contexts/SubsidiaryContext';
import { useTheme } from '@/contexts/ThemeContext';
import { SubsidiarySelector } from '@/components/subsidiary/SubsidiarySelector';

export function TopBar() {
  const { user, profile, signOut } = useAuth();
  const { currentSubsidiary } = useSubsidiary();
  const { theme, setTheme } = useTheme();

  const themeIcons = {
    light: Sun,
    dark: Moon,
    auto: Sunset,
  };

  const ThemeIcon = themeIcons[theme];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 backdrop-blur-md border-b glass-card">
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
            <SubsidiarySelector />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          {/* Subsidiary Selector - Mobile */}
          <div className="lg:hidden">
            <SubsidiarySelector compact />
          </div>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </Button>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <ThemeIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                  <AvatarFallback>
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
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