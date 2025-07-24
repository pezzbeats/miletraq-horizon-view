
import { useState, useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DesktopSidebar } from './EnhancedSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { TopBar } from './TopBar';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export function MainLayout() {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen w-full relative transition-colors duration-300">
      {/* Background Gradient Overlay */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-background/60 to-purple-50/30 dark:from-slate-900/30 dark:via-background/80 dark:to-slate-800/30" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-50/10 to-indigo-50/20 dark:via-slate-800/10 dark:to-slate-700/20" />
      </div>
      
      {/* Top Bar */}
      <TopBar />
      
      <div className="flex w-full">
        {/* Desktop Sidebar */}
        {!isMobile && <DesktopSidebar />}
        
        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-300 relative",
          !isMobile ? "ml-64" : "mb-16",
          "mt-16"
        )}>
          <div className={cn(
            "min-h-[calc(100vh-4rem)] relative custom-scrollbar",
            isMobile ? "p-4 pb-20 safe-area-bottom" : "p-4 lg:p-6"
          )}>
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNav />}
    </div>
  );
}
