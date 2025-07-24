import React, { useState, useEffect } from 'react';
import { Check, Building2, Globe, ChevronDown, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useSubsidiary } from '@/contexts/SubsidiaryContext';
import { cn } from '@/lib/utils';

interface EnhancedSubsidiarySelectorProps {
  className?: string;
}

export function EnhancedSubsidiarySelector({ className }: EnhancedSubsidiarySelectorProps) {
  const { 
    currentSubsidiary, 
    allSubsidiariesView, 
    subsidiaries, 
    canManageSubsidiaries,
    setCurrentSubsidiary,
    setAllSubsidiariesView
  } = useSubsidiary();
  
  const [open, setOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedSubsidiaries, setCachedSubsidiaries] = useState(subsidiaries);

  // Enhanced offline support
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cache subsidiaries for offline use
  useEffect(() => {
    if (isOnline && subsidiaries.length > 0) {
      setCachedSubsidiaries(subsidiaries);
      localStorage.setItem('cachedSubsidiaries', JSON.stringify(subsidiaries));
    }
  }, [subsidiaries, isOnline]);

  // Load cached subsidiaries on mount
  useEffect(() => {
    const cached = localStorage.getItem('cachedSubsidiaries');
    if (cached && (!isOnline || subsidiaries.length === 0)) {
      setCachedSubsidiaries(JSON.parse(cached));
    }
  }, [isOnline, subsidiaries]);

  const displaySubsidiaries = isOnline ? subsidiaries : cachedSubsidiaries;

  const handleSubsidiarySelect = (subsidiary: any) => {
    setCurrentSubsidiary(subsidiary);
    setAllSubsidiariesView(false);
    setOpen(false);
    
    // Cache selection for offline use
    localStorage.setItem('lastSelectedSubsidiary', JSON.stringify(subsidiary));
  };

  const handleAllSubsidiariesView = () => {
    setAllSubsidiariesView(true);
    setCurrentSubsidiary(null);
    setOpen(false);
    
    localStorage.setItem('allSubsidiariesView', 'true');
  };

  const getDisplayText = () => {
    if (allSubsidiariesView) {
      return 'All Subsidiaries';
    }
    if (currentSubsidiary) {
      return currentSubsidiary.subsidiary_name;
    }
    return 'Select Subsidiary';
  };

  const getSubsidiaryStats = (subsidiary: any) => {
    // This would be enhanced with cached metrics
    return {
      vehicles: Math.floor(Math.random() * 50) + 1,
      activeDrivers: Math.floor(Math.random() * 30) + 1,
      monthlyFuel: Math.floor(Math.random() * 500) + 100,
    };
  };

  if (!canManageSubsidiaries) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-between h-12 px-3 text-left font-normal",
            !currentSubsidiary && !allSubsidiariesView && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {allSubsidiariesView ? (
              <Globe className="h-4 w-4 text-blue-500" />
            ) : (
              <Building2 className="h-4 w-4 text-primary" />
            )}
            <span className="truncate">{getDisplayText()}</span>
            {!isOnline && (
              <WifiOff className="h-3 w-3 text-orange-500" />
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center justify-between">
            <span>Select Subsidiary</span>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Wifi className="h-3 w-3" />
                  Online
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-orange-600">
                  <WifiOff className="h-3 w-3" />
                  Offline
                </div>
              )}
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          {/* All Subsidiaries Option */}
          {canManageSubsidiaries && (
            <>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-auto p-4 text-left",
                  allSubsidiariesView && "bg-primary/10 border-primary/20"
                )}
                onClick={handleAllSubsidiariesView}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">All Subsidiaries</span>
                      {allSubsidiariesView && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Consolidated view across all subsidiaries
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{displaySubsidiaries.length} subsidiaries</span>
                    </div>
                  </div>
                </div>
              </Button>
              <Separator />
            </>
          )}

          {/* Individual Subsidiaries */}
          <div className="space-y-2">
            {displaySubsidiaries.map((subsidiary) => {
              const stats = getSubsidiaryStats(subsidiary);
              const isSelected = currentSubsidiary?.id === subsidiary.id;

              return (
                <Button
                  key={subsidiary.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-auto p-4 text-left",
                    isSelected && "bg-primary/10 border-primary/20"
                  )}
                  onClick={() => handleSubsidiarySelect(subsidiary)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {subsidiary.subsidiary_name}
                        </span>
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {subsidiary.subsidiary_code}
                      </p>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{stats.vehicles} vehicles</span>
                        <span>{stats.activeDrivers} drivers</span>
                        <span>₹{stats.monthlyFuel}k/mo fuel</span>
                      </div>
                    </div>
                    <Badge 
                      variant={subsidiary.is_active ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {subsidiary.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </Button>
              );
            })}
          </div>

          {displaySubsidiaries.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Subsidiaries Found</h3>
              <p className="text-muted-foreground">
                {!isOnline 
                  ? "No cached subsidiaries available offline"
                  : "Contact your administrator to set up subsidiaries"
                }
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}