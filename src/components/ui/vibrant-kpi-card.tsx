import * as React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { VibrantCard, VibrantCardContent } from "./vibrant-card";

interface VibrantKPICardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'fuel' | 'maintenance' | 'vehicle' | 'alert' | 'success' | 'warning' | 'purple';
  className?: string;
}

export function VibrantKPICard({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  variant = 'default',
  className
}: VibrantKPICardProps) {
  const colorMap = {
    default: 'text-blue-600 bg-blue-100',
    fuel: 'text-blue-600 bg-blue-100',
    maintenance: 'text-orange-600 bg-orange-100',
    vehicle: 'text-green-600 bg-green-100',
    alert: 'text-red-600 bg-red-100',
    success: 'text-emerald-600 bg-emerald-100',
    warning: 'text-amber-600 bg-amber-100',
    purple: 'text-purple-600 bg-purple-100',
  };

  return (
    <VibrantCard variant={variant} className={cn("p-6", className)}>
      <VibrantCardContent>
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-3 rounded-xl shadow-md", colorMap[variant])}>
            <Icon className="h-6 w-6" />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-sm font-semibold",
              trend.isPositive 
                ? "bg-green-100 text-green-700" 
                : "bg-red-100 text-red-700"
            )}>
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.value}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-800">
            {value}
          </p>
          {subValue && (
            <p className="text-base text-gray-600 font-medium">
              {subValue}
            </p>
          )}
        </div>
      </VibrantCardContent>
    </VibrantCard>
  );
}