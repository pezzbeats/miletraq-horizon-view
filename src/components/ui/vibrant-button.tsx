import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const vibrantButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-base font-bold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-blue-500/25",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-red-500/25",
        outline: "border-2 border-blue-200 bg-white text-blue-600 hover:bg-blue-50 hover:border-blue-300 shadow-md",
        secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 shadow-md",
        ghost: "hover:bg-gray-100 hover:text-gray-800",
        link: "text-blue-600 underline-offset-4 hover:underline",
        success: "bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-green-500/25",
        warning: "bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-orange-500/25",
        purple: "bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-purple-500/25",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 py-2 text-sm",
        lg: "h-14 px-8 py-4 text-lg",
        icon: "h-12 w-12",
        "icon-sm": "h-10 w-10",
        "icon-lg": "h-14 w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface VibrantButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof vibrantButtonVariants> {
  asChild?: boolean;
}

const VibrantButton = React.forwardRef<HTMLButtonElement, VibrantButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(vibrantButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
VibrantButton.displayName = "VibrantButton";

export { VibrantButton, vibrantButtonVariants };