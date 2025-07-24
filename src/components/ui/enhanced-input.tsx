import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Search, X } from "lucide-react";

const enhancedInputVariants = cva(
  "flex w-full rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "h-10 px-3 py-2",
        mobile: "mobile-form-input h-12 px-4 py-3 text-base rounded-lg border-2",
        large: "h-12 px-4 py-3 text-base",
        glass: "glass-input",
        floating: "peer h-10 px-3 py-2 placeholder-transparent",
      },
      state: {
        default: "",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-green-500 focus-visible:ring-green-500",
        warning: "border-yellow-500 focus-visible:ring-yellow-500",
      },
    },
    defaultVariants: {
      variant: "default",
      state: "default",
    },
  }
);

export interface EnhancedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof enhancedInputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  error?: string;
  success?: string;
  floatingLabel?: string;
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ 
    className, 
    variant, 
    state, 
    type, 
    leftIcon, 
    rightIcon, 
    clearable = false, 
    onClear,
    error,
    success,
    floatingLabel,
    value,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    const isPasswordType = type === "password";
    const actualType = isPasswordType && showPassword ? "text" : type;
    const hasValue = value !== undefined && value !== "";

    const handleClear = () => {
      if (onClear) {
        onClear();
      }
    };

    const inputElement = (
      <input
        type={actualType}
        className={cn(
          enhancedInputVariants({ variant, state, className }),
          leftIcon && "pl-10",
          (rightIcon || clearable || isPasswordType) && "pr-10",
          error && "border-destructive focus-visible:ring-destructive",
          success && "border-green-500 focus-visible:ring-green-500"
        )}
        ref={ref}
        value={value}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
    );

    if (variant === "floating" && floatingLabel) {
      return (
        <div className="relative">
          {inputElement}
          <label
            className={cn(
              "absolute left-3 transition-all duration-200 pointer-events-none",
              isFocused || hasValue
                ? "-top-2 text-xs bg-background px-1 text-primary"
                : "top-2 text-sm text-muted-foreground"
            )}
          >
            {floatingLabel}
          </label>
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          {(rightIcon || clearable || isPasswordType) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              {clearable && hasValue && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-sm hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {isPasswordType && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-sm hover:bg-muted transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              )}
              {rightIcon}
            </div>
          )}
          {error && (
            <p className="text-xs text-destructive mt-1">{error}</p>
          )}
          {success && (
            <p className="text-xs text-green-600 mt-1">{success}</p>
          )}
        </div>
      );
    }

    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        {inputElement}
        {(rightIcon || clearable || isPasswordType) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {clearable && hasValue && (
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground p-1 rounded-sm hover:bg-muted transition-colors touch-target"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {isPasswordType && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-sm hover:bg-muted transition-colors touch-target"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
            {rightIcon}
          </div>
        )}
        {error && (
          <p className="text-xs text-destructive mt-1 animate-fade-in-scale">{error}</p>
        )}
        {success && (
          <p className="text-xs text-green-600 mt-1 animate-fade-in-scale">{success}</p>
        )}
      </div>
    );
  }
);
EnhancedInput.displayName = "EnhancedInput";

// Search Input Component
const SearchInput = React.forwardRef<HTMLInputElement, Omit<EnhancedInputProps, 'leftIcon' | 'type'>>(
  ({ placeholder = "Search...", ...props }, ref) => (
    <EnhancedInput
      ref={ref}
      type="search"
      placeholder={placeholder}
      leftIcon={<Search className="h-4 w-4" />}
      clearable
      {...props}
    />
  )
);
SearchInput.displayName = "SearchInput";

export { EnhancedInput, SearchInput, enhancedInputVariants };