
import { useState, useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DesktopSidebar } from './DesktopSidebar';
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
    <div className="min-h-screen w-full bg-background">
      {/* Top Bar */}
      <TopBar />
      
      <div className="flex w-full">
        {/* Desktop Sidebar */}
        {!isMobile && <DesktopSidebar />}
        
        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-300",
          !isMobile ? "ml-64" : "mb-16",
          "mt-16"
        )}>
          <div className={cn(
            "min-h-[calc(100vh-4rem)]",
            isMobile ? "p-4 pb-20" : "p-4 lg:p-6"
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
