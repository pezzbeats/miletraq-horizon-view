import React from 'react';
import { cn } from '@/lib/utils';
import { StatusLight } from './status-light';

interface AutomotiveCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'instrument' | 'metallic';
  glowEffect?: boolean;
}

interface VehicleStatusCardProps {
  vehicleName: string;
  subsidiary: string;
  fuelLevel: number;
  efficiency: number;
  driverName: string;
  lastService: string;
  status: 'active' | 'warning' | 'danger' | 'info';
  className?: string;
}

export const AutomotiveCard: React.FC<AutomotiveCardProps> = ({
  children,
  className,
  variant = 'default',
  glowEffect = false
}) => {
  const variants = {
    default: 'vehicle-card',
    instrument: 'surface-instrument text-white',
    metallic: 'surface-metallic'
  };

  return (
    <div className={cn(
      variants[variant],
      glowEffect && "hover-glow",
      className
    )}>
      {children}
    </div>
  );
};

export const VehicleStatusCard: React.FC<VehicleStatusCardProps> = ({
  vehicleName,
  subsidiary,
  fuelLevel,
  efficiency,
  driverName,
  lastService,
  status,
  className
}) => {
  return (
    <AutomotiveCard className={cn("space-y-4", className)} glowEffect>
      {/* Vehicle Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg font-display">{vehicleName}</h3>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            {subsidiary}
          </span>
        </div>
        <StatusLight status={status} size="lg" />
      </div>
      
      {/* Instrument Cluster */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="mini-gauge mx-auto mb-1" style={{
            '--gauge-angle': `${(fuelLevel / 100) * 180}deg`
          } as React.CSSProperties} />
          <div className="text-xs font-medium">Fuel</div>
          <div className="text-sm font-mono font-bold">{fuelLevel}%</div>
        </div>
        <div className="text-center">
          <div className="mini-gauge mx-auto mb-1" style={{
            '--gauge-angle': `${(efficiency / 25) * 180}deg`
          } as React.CSSProperties} />
          <div className="text-xs font-medium">Efficiency</div>
          <div className="text-sm font-mono font-bold">{efficiency} km/L</div>
        </div>
      </div>
      
      {/* Vehicle Info */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-muted rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-foreground rounded-full" />
          </div>
          <span className="font-medium">{driverName}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-muted rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-muted-foreground rounded-full" />
          </div>
          <span className="text-muted-foreground">Service: {lastService}</span>
        </div>
      </div>
    </AutomotiveCard>
  );
};