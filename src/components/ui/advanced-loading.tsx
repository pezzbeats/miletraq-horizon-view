import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, CheckCircle, Info, Wifi, WifiOff } from "lucide-react";

// Advanced Loading States
export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "spinner" | "dots" | "skeleton" | "pulse" | "progress";
  size?: "sm" | "default" | "lg";
  text?: string;
  progress?: number; // 0-100 for progress variant
}

const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
  ({ className, variant = "spinner", size = "default", text, progress, ...props }, ref) => {
    const sizes = {
      sm: "h-4 w-4",
      default: "h-6 w-6", 
      lg: "h-8 w-8",
    };

    const renderVariant = () => {
      switch (variant) {
        case "spinner":
          return (
            <div className="flex items-center gap-3">
              <Loader2 className={cn("animate-spin", sizes[size])} />
              {text && <span className="text-sm text-muted-foreground">{text}</span>}
            </div>
          );
        
        case "dots":
          return (
            <div className="flex items-center gap-3">
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-full bg-primary animate-pulse",
                      size === "sm" ? "h-2 w-2" : size === "lg" ? "h-4 w-4" : "h-3 w-3"
                    )}
                    style={{
                      animationDelay: `${i * 0.15}s`,
                      animationDuration: "1s",
                    }}
                  />
                ))}
              </div>
              {text && <span className="text-sm text-muted-foreground">{text}</span>}
            </div>
          );

        case "skeleton":
          return (
            <div className="space-y-3">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-4 w-2/3" />
            </div>
          );

        case "pulse":
          return (
            <div className="flex items-center gap-3">
              <div className={cn(
                "rounded-full bg-primary animate-pulse-glow",
                sizes[size]
              )} />
              {text && <span className="text-sm text-muted-foreground">{text}</span>}
            </div>
          );

        case "progress":
          return (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                {text && <span className="text-sm text-muted-foreground">{text}</span>}
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress || 0}%` }}
                />
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center p-4", className)}
        {...props}
      >
        {renderVariant()}
      </div>
    );
  }
);
LoadingState.displayName = "LoadingState";

// Progressive Loading Wrapper
export interface ProgressiveLoadingProps {
  children: React.ReactNode;
  isLoading: boolean;
  loadingText?: string;
  error?: string | null;
  retry?: () => void;
  skeleton?: React.ReactNode;
}

const ProgressiveLoading: React.FC<ProgressiveLoadingProps> = ({
  children,
  isLoading,
  loadingText = "Loading...",
  error,
  retry,
  skeleton,
}) => {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">Something went wrong</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
        {retry && (
          <button
            onClick={retry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (isLoading) {
    return skeleton || <LoadingState text={loadingText} />;
  }

  return <>{children}</>;
};

// Connection Status Indicator
export const ConnectionStatus: React.FC = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg animate-slide-up">
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">You're offline</span>
      </div>
    </div>
  );
};

// Success/Error Toast-like Notifications
export interface FeedbackNotificationProps {
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  visible: boolean;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export const FeedbackNotification: React.FC<FeedbackNotificationProps> = ({
  type,
  title,
  description,
  visible,
  onClose,
  autoClose = true,
  duration = 5000,
}) => {
  React.useEffect(() => {
    if (visible && autoClose && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, autoClose, onClose, duration]);

  if (!visible) return null;

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info,
  };

  const Icon = icons[type];

  const styles = {
    success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400",
    error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400",
    info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400",
  };

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
      <div className={cn(
        "max-w-sm p-4 border rounded-lg shadow-lg backdrop-blur-sm",
        styles[type]
      )}>
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{title}</p>
            {description && (
              <p className="text-xs mt-1 opacity-90">{description}</p>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 hover:bg-black/10 rounded transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export { LoadingState, ProgressiveLoading };