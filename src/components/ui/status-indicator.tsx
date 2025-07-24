import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusIndicatorVariants = cva(
  "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        success: "status-online",
        warning: "status-away", 
        error: "status-offline",
        info: "status-busy",
        default: "bg-muted text-muted-foreground",
      },
      size: {
        sm: "px-2 py-1 text-xs",
        default: "px-3 py-1.5 text-xs",
        lg: "px-4 py-2 text-sm",
      },
      animated: {
        true: "animate-pulse-glow",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animated: false,
    },
  }
);

export interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusIndicatorVariants> {
  showDot?: boolean;
  dotPosition?: "left" | "right";
}

const StatusIndicator = React.forwardRef<HTMLSpanElement, StatusIndicatorProps>(
  ({ 
    className, 
    variant, 
    size, 
    animated, 
    showDot = true, 
    dotPosition = "left",
    children,
    ...props 
  }, ref) => (
    <span
      ref={ref}
      className={cn(statusIndicatorVariants({ variant, size, animated, className }))}
      {...props}
    >
      {showDot && dotPosition === "left" && (
        <span 
          className={cn(
            "w-2 h-2 rounded-full", 
            animated && "animate-pulse",
            variant === "success" && "bg-green-100",
            variant === "warning" && "bg-yellow-100", 
            variant === "error" && "bg-red-100",
            variant === "info" && "bg-blue-100",
            variant === "default" && "bg-muted-foreground/30"
          )}
        />
      )}
      {children}
      {showDot && dotPosition === "right" && (
        <span 
          className={cn(
            "w-2 h-2 rounded-full",
            animated && "animate-pulse",
            variant === "success" && "bg-green-100",
            variant === "warning" && "bg-yellow-100",
            variant === "error" && "bg-red-100", 
            variant === "info" && "bg-blue-100",
            variant === "default" && "bg-muted-foreground/30"
          )}
        />
      )}
    </span>
  )
);
StatusIndicator.displayName = "StatusIndicator";

export { StatusIndicator, statusIndicatorVariants };