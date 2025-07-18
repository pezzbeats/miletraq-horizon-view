import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Fuel, Car, Route, Calendar, FileText, Users, Wrench, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => void;
  variant: 'default' | 'outline';
  permission?: string;
  gradient?: string;
}

interface QuickActionsProps {
  onAddFuelLog?: () => void;
  onAddVehicle?: () => void;
  onUpdateOdometer?: () => void;
  onScheduleMaintenance?: () => void;
  onUploadDocument?: () => void;
  onAddDriver?: () => void;
  className?: string;
}

export const QuickActions = ({
  onAddFuelLog,
  onAddVehicle,
  onUpdateOdometer,
  onScheduleMaintenance,
  onUploadDocument,
  onAddDriver,
  className = ''
}: QuickActionsProps) => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const quickActions: QuickAction[] = [
    {
      id: 'fuel-log',
      title: 'Add Fuel Log',
      description: 'Record fuel consumption',
      icon: Fuel,
      action: onAddFuelLog || (() => navigate('/fuel-log')),
      variant: 'default',
      permission: 'fuel_log_create',
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      id: 'vehicle',
      title: 'Add Vehicle',
      description: 'Register new vehicle',
      icon: Car,
      action: onAddVehicle || (() => navigate('/vehicles')),
      variant: 'outline',
      permission: 'vehicle_create',
      gradient: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    {
      id: 'odometer',
      title: 'Update Odometer',
      description: 'Record odometer reading',
      icon: Route,
      action: onUpdateOdometer || (() => navigate('/odometer')),
      variant: 'outline',
      permission: 'odometer_create',
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      id: 'maintenance',
      title: 'Schedule Maintenance',
      description: 'Plan maintenance work',
      icon: Calendar,
      action: onScheduleMaintenance || (() => navigate('/maintenance')),
      variant: 'outline',
      permission: 'maintenance_create',
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600'
    },
    {
      id: 'document',
      title: 'Upload Document',
      description: 'Add vehicle documents',
      icon: FileText,
      action: onUploadDocument || (() => navigate('/documents')),
      variant: 'outline',
      permission: 'document_create',
      gradient: 'bg-gradient-to-br from-teal-500 to-teal-600'
    },
    {
      id: 'driver',
      title: 'Add Driver',
      description: 'Register new driver',
      icon: Users,
      action: onAddDriver || (() => navigate('/drivers')),
      variant: 'outline',
      permission: 'driver_create',
      gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-600'
    },
    {
      id: 'maintenance-log',
      title: 'Log Maintenance',
      description: 'Record completed work',
      icon: Wrench,
      action: () => navigate('/maintenance'),
      variant: 'outline',
      permission: 'maintenance_create',
      gradient: 'bg-gradient-to-br from-red-500 to-red-600'
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      description: 'Fleet performance insights',
      icon: BarChart3,
      action: () => navigate('/analytics'),
      variant: 'outline',
      gradient: 'bg-gradient-to-br from-gray-500 to-gray-600'
    }
  ];

  const filteredActions = quickActions.filter(action => 
    !action.permission || hasPermission(action.permission as any)
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-blue-500" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {filteredActions.map((action) => {
            const Icon = action.icon;
            
            return (
              <Button
                key={action.id}
                variant={action.variant}
                className={`h-20 flex-col gap-2 p-3 relative overflow-hidden group ${
                  action.variant === 'default' 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                    : 'hover:border-primary/50'
                }`}
                onClick={action.action}
              >
                {action.variant === 'default' && action.gradient && (
                  <div className={`absolute inset-0 ${action.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
                )}
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <Icon className={`h-5 w-5 ${
                    action.variant === 'default' ? 'text-white' : 'text-current'
                  }`} />
                  <div className="text-center">
                    <div className={`text-xs font-medium ${
                      action.variant === 'default' ? 'text-white' : 'text-current'
                    }`}>
                      {action.title}
                    </div>
                    <div className={`text-xs opacity-80 ${
                      action.variant === 'default' ? 'text-white' : 'text-muted-foreground'
                    }`}>
                      {action.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};