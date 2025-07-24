import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const vibrantCardVariants = cva(
  "rounded-xl bg-white border-l-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1",
  {
    variants: {
      variant: {
        default: "border-l-blue-500",
        fuel: "border-l-blue-500 hover:bg-blue-50/50",
        maintenance: "border-l-orange-500 hover:bg-orange-50/50",
        vehicle: "border-l-green-500 hover:bg-green-50/50",
        alert: "border-l-red-500 hover:bg-red-50/50",
        success: "border-l-emerald-500 hover:bg-emerald-50/50",
        warning: "border-l-amber-500 hover:bg-amber-50/50",
        purple: "border-l-purple-500 hover:bg-purple-50/50",
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface VibrantCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof vibrantCardVariants> {}

const VibrantCard = React.forwardRef<HTMLDivElement, VibrantCardProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(vibrantCardVariants({ variant, size, className }))}
      {...props}
    />
  )
);
VibrantCard.displayName = "VibrantCard";

const VibrantCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 pb-4", className)}
    {...props}
  />
));
VibrantCardHeader.displayName = "VibrantCardHeader";

const VibrantCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-bold leading-none tracking-tight text-gray-800",
      className
    )}
    {...props}
  />
));
VibrantCardTitle.displayName = "VibrantCardTitle";

const VibrantCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-base text-gray-600 font-medium", className)}
    {...props}
  />
));
VibrantCardDescription.displayName = "VibrantCardDescription";

const VibrantCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-gray-700", className)} {...props} />
));
VibrantCardContent.displayName = "VibrantCardContent";

const VibrantCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4 border-t-2 border-gray-100", className)}
    {...props}
  />
));
VibrantCardFooter.displayName = "VibrantCardFooter";

export {
  VibrantCard,
  VibrantCardHeader,
  VibrantCardFooter,
  VibrantCardTitle,
  VibrantCardDescription,
  VibrantCardContent,
  vibrantCardVariants,
};