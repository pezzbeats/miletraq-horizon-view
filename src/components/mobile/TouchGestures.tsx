import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Navigation, 
  MapPin, 
  Camera, 
  Mic, 
  Volume2,
  VolumeX,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move3D
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TouchGesturesProps {
  className?: string;
}

export function TouchGestures({ className }: TouchGesturesProps) {
  const [gestureHistory, setGestureHistory] = useState<string[]>([]);
  const [currentGesture, setCurrentGesture] = useState<string>('');
  const [isPinching, setIsPinching] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const gestureAreaRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);

  // Voice recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const command = event.results[0][0].transcript.toLowerCase();
        handleVoiceCommand(command);
      };
      
      recognition.onerror = () => {
        setIsVoiceEnabled(false);
        toast({
          title: "Voice Error",
          description: "Voice recognition failed",
          variant: "destructive",
        });
      };
    }
  }, []);

  const addGesture = (gesture: string) => {
    setGestureHistory(prev => [...prev.slice(-4), gesture]);
    setCurrentGesture(gesture);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    toast({
      title: "Gesture Detected",
      description: gesture,
    });
  };

  const handleVoiceCommand = (command: string) => {
    console.log('Voice command:', command);
    
    if (command.includes('add vehicle')) {
      toast({
        title: "Voice Command",
        description: "Adding new vehicle...",
      });
    } else if (command.includes('fuel log')) {
      toast({
        title: "Voice Command",
        description: "Opening fuel log...",
      });
    } else if (command.includes('refresh')) {
      toast({
        title: "Voice Command",
        description: "Refreshing data...",
      });
    } else {
      toast({
        title: "Voice Command",
        description: `Command not recognized: "${command}"`,
        variant: "destructive",
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    
    if (e.touches.length === 2) {
      setIsPinching(true);
      setCurrentGesture('Pinch/Zoom gesture started');
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !lastTouchRef.current) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - lastTouchRef.current.x;
    const deltaY = touch.clientY - lastTouchRef.current.y;
    
    if (e.touches.length === 2) {
      setCurrentGesture('Pinching/Zooming...');
    } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 10) {
        setCurrentGesture('Swiping right');
      } else if (deltaX < -10) {
        setCurrentGesture('Swiping left');
      }
    } else {
      if (deltaY > 10) {
        setCurrentGesture('Swiping down');
      } else if (deltaY < -10) {
        setCurrentGesture('Swiping up');
      }
    }
    
    lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    setIsPinching(false);
    
    if (deltaTime < 200 && distance < 10) {
      addGesture('Quick Tap');
    } else if (deltaTime > 500 && distance < 10) {
      addGesture('Long Press');
    } else if (distance > 50) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          addGesture('Swipe Right');
        } else {
          addGesture('Swipe Left');
        }
      } else {
        if (deltaY > 0) {
          addGesture('Swipe Down');
        } else {
          addGesture('Swipe Up');
        }
      }
    }
    
    touchStartRef.current = null;
    lastTouchRef.current = null;
    setCurrentGesture('');
  };

  const toggleVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast({
        title: "Voice Recognition",
        description: "Not supported in this browser",
        variant: "destructive",
      });
      return;
    }

    if (isVoiceEnabled) {
      setIsVoiceEnabled(false);
      toast({
        title: "Voice Recognition",
        description: "Voice commands disabled",
      });
    } else {
      setIsVoiceEnabled(true);
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.start();
      
      toast({
        title: "Voice Recognition",
        description: "Listening for commands... Try 'add vehicle' or 'fuel log'",
      });
    }
  };

  const requestLocationAccess = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location",
        description: "Geolocation not supported",
        variant: "destructive",
      });
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      toast({
        title: "Location Access",
        description: `Location: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
      });
    } catch (error) {
      toast({
        title: "Location Error",
        description: "Unable to get location",
        variant: "destructive",
      });
    }
  };

  const clearGestureHistory = () => {
    setGestureHistory([]);
    setCurrentGesture('');
  };

  return (
    <Card className={`mobile-touch-gestures ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Move3D className="h-5 w-5 mr-2" />
            Touch & Voice Controls
          </span>
          <Badge variant="outline" className="text-xs">
            {gestureHistory.length} gestures
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Touch Gesture Area */}
        <div
          ref={gestureAreaRef}
          className="h-32 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="text-center">
            <Move3D className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {currentGesture || 'Touch, swipe, or pinch here'}
            </p>
            {isPinching && (
              <Badge variant="secondary" className="mt-2">
                Pinch Gesture Active
              </Badge>
            )}
          </div>
        </div>

        {/* Device Feature Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="sm"
            className="h-16 flex flex-col gap-1 touch-target"
            onClick={requestLocationAccess}
          >
            <MapPin className="h-4 w-4" />
            <span className="text-xs">Location</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-16 flex flex-col gap-1 touch-target"
            onClick={toggleVoiceRecognition}
          >
            {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="text-xs">Voice</span>
          </Button>
        </div>

        {/* Gesture History */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Recent Gestures</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 p-1"
              onClick={clearGestureHistory}
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="space-y-1">
            {gestureHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground">No gestures recorded yet</p>
            ) : (
              gestureHistory.map((gesture, index) => (
                <div key={index} className="flex items-center justify-between text-xs p-2 bg-muted/50 rounded">
                  <span>{gesture}</span>
                  <Badge variant="outline" className="text-xs">
                    {gestureHistory.length - index}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Voice Commands Help */}
        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-1">Voice Commands:</p>
          <ul className="space-y-0.5 text-xs">
            <li>• "Add vehicle" - Create new vehicle</li>
            <li>• "Fuel log" - Open fuel logging</li>
            <li>• "Refresh" - Refresh current data</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}