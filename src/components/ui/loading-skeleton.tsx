import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "rounded" | "circular";
  width?: string | number;
  height?: string | number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "default", width, height, style, ...props }, ref) => {
    const variants = {
      default: "rounded-md",
      rounded: "rounded-lg",
      circular: "rounded-full",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "skeleton bg-muted/50",
          variants[variant],
          className
        )}
        style={{
          width,
          height,
          ...style,
        }}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";

// Pre-built skeleton components
const SkeletonText = ({ lines = 3, className, ...props }: { lines?: number } & SkeletonProps) => (
  <div className={cn("space-y-2", className)} {...props}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height="1rem"
        width={i === lines - 1 ? "60%" : "100%"}
      />
    ))}
  </div>
);

const SkeletonCard = ({ className, ...props }: SkeletonProps) => (
  <div className={cn("space-y-4 p-4 border rounded-lg", className)} {...props}>
    <div className="flex items-center space-x-4">
      <Skeleton variant="circular" width="2.5rem" height="2.5rem" />
      <div className="space-y-2 flex-1">
        <Skeleton height="1rem" width="40%" />
        <Skeleton height="0.75rem" width="60%" />
      </div>
    </div>
    <SkeletonText lines={2} />
  </div>
);

const SkeletonTable = ({ rows = 5, cols = 4, className, ...props }: { rows?: number; cols?: number } & SkeletonProps) => (
  <div className={cn("space-y-3", className)} {...props}>
    {/* Header */}
    <div className="flex space-x-4">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} height="1.25rem" width="100%" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <Skeleton key={colIndex} height="1rem" width="100%" />
        ))}
      </div>
    ))}
  </div>
);

export { Skeleton, SkeletonText, SkeletonCard, SkeletonTable };