
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
      {/* Calm neutral canvas with restrained module-colored ambient light */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/10" />
        <div className="absolute -right-28 top-16 h-[28rem] w-[28rem] rounded-full bg-cyan-300/10 blur-3xl dark:bg-cyan-500/8" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-300/8 blur-3xl dark:bg-emerald-500/5" />
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
