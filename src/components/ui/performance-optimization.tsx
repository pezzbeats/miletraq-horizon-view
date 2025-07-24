import * as React from "react";
import { cn } from "@/lib/utils";

// Performance optimization hooks
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [entry, setEntry] = React.useState<IntersectionObserverEntry | null>(null);
  const elementRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      setEntry(entry);
    }, options);

    observer.observe(element);

    return () => observer.disconnect();
  }, [options]);

  return { ref: elementRef, isIntersecting, entry };
};

// Lazy loading component
export interface LazyLoadProps {
  children: React.ReactNode;
  height?: number;
  offset?: number;
  placeholder?: React.ReactNode;
  onLoad?: () => void;
}

export const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  height = 200,
  offset = 100,
  placeholder,
  onLoad,
}) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    rootMargin: `${offset}px`,
    threshold: 0.1,
  });

  React.useEffect(() => {
    if (isIntersecting && onLoad) {
      onLoad();
    }
  }, [isIntersecting, onLoad]);

  return (
    <div ref={ref} style={{ minHeight: height }}>
      {isIntersecting ? (
        children
      ) : (
        placeholder || (
          <div 
            className="flex items-center justify-center bg-muted/30 rounded-lg animate-pulse" 
            style={{ height }}
          >
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        )
      )}
    </div>
  );
};

// Virtual list for large datasets
export interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
      className="custom-scrollbar"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Memoized card component for performance
export interface OptimizedCardProps {
  id: string;
  title: string;
  description?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const OptimizedCard = React.memo<OptimizedCardProps>(({
  id,
  title,
  description,
  onClick,
  children,
}) => (
  <div
    className={cn(
      "mobile-card hover-lift cursor-pointer",
      onClick && "hover:shadow-lg transition-shadow duration-200"
    )}
    onClick={onClick}
  >
    <h3 className="font-medium text-sm mb-1">{title}</h3>
    {description && (
      <p className="text-xs text-muted-foreground mb-2">{description}</p>
    )}
    {children}
  </div>
));

OptimizedCard.displayName = "OptimizedCard";

// Error boundary for better error handling
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{
    fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  }>,
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback;
      return (
        <Fallback
          error={this.state.error!}
          retry={() => this.setState({ hasError: false, error: undefined })}
        />
      );
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({
  error,
  retry,
}) => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4 border border-destructive/20 rounded-lg bg-destructive/5">
    <div className="text-center space-y-2">
      <h2 className="text-lg font-semibold text-destructive">Something went wrong</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        {error.message || "An unexpected error occurred"}
      </p>
    </div>
    <button
      onClick={retry}
      className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
    >
      Try Again
    </button>
  </div>
);

// Bundle analyzer simulation (development only)
export const BundleAnalyzer: React.FC = () => {
  if (process.env.NODE_ENV !== 'development') return null;

  const [showAnalyzer, setShowAnalyzer] = React.useState(false);

  const bundleInfo = {
    totalSize: "2.4 MB",
    gzippedSize: "892 KB",
    chunks: [
      { name: "vendor", size: "1.2 MB", description: "Third-party libraries" },
      { name: "app", size: "800 KB", description: "Application code" },
      { name: "assets", size: "400 KB", description: "Images and fonts" },
    ],
  };

  return (
    <>
      <button
        onClick={() => setShowAnalyzer(!showAnalyzer)}
        className="fixed bottom-4 left-4 z-50 px-3 py-2 bg-yellow-500 text-yellow-900 rounded-md text-xs font-medium"
      >
        Bundle Info
      </button>

      {showAnalyzer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Bundle Analysis</h3>
              <button
                onClick={() => setShowAnalyzer(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              <div className="text-sm">
                <strong>Total Size:</strong> {bundleInfo.totalSize}
              </div>
              <div className="text-sm">
                <strong>Gzipped:</strong> {bundleInfo.gzippedSize}
              </div>
              <div className="space-y-2">
                <strong className="text-sm">Chunks:</strong>
                {bundleInfo.chunks.map((chunk) => (
                  <div key={chunk.name} className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>{chunk.name}</span>
                      <span>{chunk.size}</span>
                    </div>
                    <p className="text-muted-foreground">{chunk.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};