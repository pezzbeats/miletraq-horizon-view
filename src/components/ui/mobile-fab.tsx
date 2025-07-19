
import React from 'react';
import { Plus, LucideIcon } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface MobileFABProps {
  onClick: () => void;
  icon?: LucideIcon;
  label?: string;
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MobileFAB({ 
  onClick, 
  icon: Icon = Plus, 
  label,
  variant = 'default',
  size = 'md',
  className 
}: MobileFABProps) {
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-14 w-14',
    lg: 'h-16 w-16'
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7'
  };

  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-20 right-4 rounded-full shadow-lg z-40 transition-all duration-300 hover:scale-110 active:scale-95 touch-target",
        sizeClasses[size],
        variant === 'primary' && "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25",
        variant === 'secondary' && "bg-secondary hover:bg-secondary/90 text-secondary-foreground",
        className
      )}
      size="icon"
      aria-label={label}
    >
      <Icon className={iconSizes[size]} />
    </Button>
  );
}
