import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "text-responsive-2xl font-bold tracking-tight",
      h2: "text-responsive-xl font-semibold tracking-tight",
      h3: "text-responsive-lg font-semibold tracking-tight",
      h4: "text-responsive-base font-medium tracking-tight",
      p: "text-responsive-sm leading-relaxed",
      lead: "text-responsive-base text-muted-foreground leading-relaxed",
      large: "text-responsive-lg font-medium",
      small: "text-responsive-xs text-muted-foreground",
      muted: "text-responsive-sm text-muted-foreground",
      caption: "text-xs text-muted-foreground uppercase tracking-wide",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    },
    weight: {
      light: "font-light",
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
  },
  defaultVariants: {
    variant: "p",
    align: "left",
  },
});

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, align, weight, as, ...props }, ref) => {
    // Auto-select element based on variant if not specified
    const Component = as || (variant?.startsWith('h') ? variant as 'h1' : 'p');
    
    return React.createElement(Component, {
      ref,
      className: cn(typographyVariants({ variant, align, weight, className })),
      ...props,
    });
  }
);
Typography.displayName = "Typography";

// Convenience components
const Title = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="h1"
      className={cn("mb-4", className)}
      {...props}
    />
  )
);
Title.displayName = "Title";

const Subtitle = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="h2"
      className={cn("mb-3", className)}
      {...props}
    />
  )
);
Subtitle.displayName = "Subtitle";

const Heading = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="h3"
      className={cn("mb-2", className)}
      {...props}
    />
  )
);
Heading.displayName = "Heading";

const Text = React.forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="p"
      className={cn("mb-2", className)}
      {...props}
    />
  )
);
Text.displayName = "Text";

const Caption = React.forwardRef<HTMLSpanElement, Omit<TypographyProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="caption"
      as="span"
      className={className}
      {...props}
    />
  )
);
Caption.displayName = "Caption";

export {
  Typography,
  Title,
  Subtitle,
  Heading,
  Text,
  Caption,
  typographyVariants,
};