import React, { useState } from 'react';
import { Plus, X, LucideIcon } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface FABAction {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
}

interface ExpandableFABProps {
  actions: FABAction[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ExpandableFAB({ 
  actions, 
  className,
  size = 'md' 
}: ExpandableFABProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const sizeClasses = {
    sm: { main: 'h-12 w-12', action: 'h-10 w-10', icon: 'h-4 w-4' },
    md: { main: 'h-14 w-14', action: 'h-12 w-12', icon: 'h-5 w-5' },
    lg: { main: 'h-16 w-16', action: 'h-14 w-14', icon: 'h-6 w-6' }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleActionClick = (action: FABAction) => {
    action.onClick();
    setIsExpanded(false);
  };

  return (
    <div className={cn("fixed bottom-32 right-4 z-50", className)}>
      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      {/* Action Buttons */}
      <div className="flex flex-col-reverse items-end gap-3 mb-3">
        {actions.map((action, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-3 transition-all duration-300 ease-out",
              isExpanded 
                ? "opacity-100 translate-y-0 scale-100" 
                : "opacity-0 translate-y-4 scale-75 pointer-events-none",
              `delay-[${index * 50}ms]`
            )}
          >
            {/* Label */}
            <div className="bg-background border shadow-lg rounded-lg px-3 py-2 whitespace-nowrap">
              <span className="text-sm font-medium">{action.label}</span>
            </div>
            
            {/* Action Button */}
            <Button
              onClick={() => handleActionClick(action)}
              className={cn(
                "rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25",
                sizeClasses[size].action
              )}
              size="icon"
              variant="default"
            >
              <action.icon className={sizeClasses[size].icon} />
            </Button>
          </div>
        ))}
      </div>

      {/* Main FAB */}
      <Button
        onClick={toggleExpand}
        className={cn(
          "rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25",
          sizeClasses[size].main
        )}
        size="icon"
      >
        <div className={cn("transition-transform duration-300", isExpanded && "rotate-45")}>
          {isExpanded ? (
            <X className={sizeClasses[size].icon} />
          ) : (
            <Plus className={sizeClasses[size].icon} />
          )}
        </div>
      </Button>
    </div>
  );
}