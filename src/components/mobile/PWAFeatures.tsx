import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Vibrate, Camera, Share2, Download, Bell, Wifi, WifiOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PWAFeaturesProps {
  className?: string;
}

export function PWAFeatures({ className }: PWAFeaturesProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(isStandalone);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) {
      toast({
        title: "Install App",
        description: "Use your browser's menu to install this app",
      });
      return;
    }

    const result = await installPrompt.prompt();
    if (result.outcome === 'accepted') {
      setIsInstalled(true);
      toast({
        title: "App Installed",
        description: "MileTraq has been installed on your device",
      });
    }
    setInstallPrompt(null);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MileTraq Fleet Management',
          text: 'Professional fleet management made simple',
          url: window.location.origin,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.origin);
      toast({
        title: "Link Copied",
        description: "App link copied to clipboard",
      });
    }
  };

  const handleCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
      toast({
        title: "Camera Access",
        description: "Camera is available for document capture",
      });
    } catch (error) {
      toast({
        title: "Camera Access",
        description: "Camera access denied or not available",
        variant: "destructive",
      });
    }
  };

  const triggerVibration = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
      toast({
        title: "Vibration",
        description: "Haptic feedback activated",
      });
    } else {
      toast({
        title: "Vibration",
        description: "Vibration not supported on this device",
        variant: "destructive",
      });
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notifications",
        description: "Notifications not supported",
        variant: "destructive",
      });
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      toast({
        title: "Notifications Enabled",
        description: "You'll receive alerts for important updates",
      });
      
      // Show a test notification
      new Notification('MileTraq Notifications', {
        body: 'Notifications are now enabled for this app',
        icon: '/favicon.ico',
      });
    } else {
      toast({
        title: "Notifications Denied",
        description: "Enable notifications in browser settings",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={`mobile-pwa-features ${className}`}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">App Features</h3>
          <div className="flex items-center space-x-1">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            <span className="text-xs text-muted-foreground">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Install App */}
          {!isInstalled && installPrompt && (
            <Button
              variant="outline"
              size="sm"
              className="h-16 flex flex-col gap-1 touch-target"
              onClick={handleInstallApp}
            >
              <Download className="h-4 w-4" />
              <span className="text-xs">Install App</span>
            </Button>
          )}

          {/* Share App */}
          <Button
            variant="outline"
            size="sm"
            className="h-16 flex flex-col gap-1 touch-target"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            <span className="text-xs">Share</span>
          </Button>

          {/* Camera Access */}
          <Button
            variant="outline"
            size="sm"
            className="h-16 flex flex-col gap-1 touch-target"
            onClick={handleCameraAccess}
          >
            <Camera className="h-4 w-4" />
            <span className="text-xs">Camera</span>
          </Button>

          {/* Vibration */}
          <Button
            variant="outline"
            size="sm"
            className="h-16 flex flex-col gap-1 touch-target"
            onClick={triggerVibration}
          >
            <Vibrate className="h-4 w-4" />
            <span className="text-xs">Haptics</span>
          </Button>

          {/* Notifications */}
          <Button
            variant="outline"
            size="sm"
            className="h-16 flex flex-col gap-1 touch-target col-span-2"
            onClick={requestNotificationPermission}
          >
            <Bell className="h-4 w-4" />
            <span className="text-xs">Enable Notifications</span>
          </Button>
        </div>

        {/* App Status */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>App Status:</span>
            <span>{isInstalled ? 'Installed' : 'Browser'}</span>
          </div>
          <div className="flex justify-between">
            <span>Connection:</span>
            <span>{isOnline ? 'Online' : 'Offline Mode'}</span>
          </div>
          <div className="flex justify-between">
            <span>Notifications:</span>
            <span>{Notification.permission}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Service Worker Registration (optional enhancement)
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};