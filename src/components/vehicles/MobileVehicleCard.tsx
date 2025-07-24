
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car, Edit, Trash2, Building2, User } from 'lucide-react';

interface MobileVehicleCardProps {
  vehicle: any;
  onEdit: (vehicle: any) => void;
  onDelete: (vehicle: any) => void;
  showSubsidiary?: boolean;
  subsidiaryInfo?: any;
}

export function MobileVehicleCard({ 
  vehicle, 
  onEdit, 
  onDelete, 
  showSubsidiary = false,
  subsidiaryInfo 
}: MobileVehicleCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'maintenance':
        return 'bg-red-500';
      case 'inactive':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="relative bg-card border-l-4 border-l-primary shadow-xl hover:shadow-2xl transition-all duration-300 border-primary/20">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 shadow-md">
              <Car className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-card-foreground">{vehicle.vehicle_number}</h3>
              {vehicle.vehicle_name && (
                <p className="text-base text-card-foreground opacity-75 font-medium">{vehicle.vehicle_name}</p>
              )}
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full shadow-sm ${getStatusColor(vehicle.status)}`} />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-card-foreground opacity-80 font-semibold text-base">Make & Model:</span>
            <span className="font-bold text-card-foreground text-base">{vehicle.make} {vehicle.model}</span>
          </div>
          
          {vehicle.year && (
            <div className="flex justify-between items-center">
              <span className="text-card-foreground opacity-80 font-semibold text-base">Year:</span>
              <span className="font-bold text-card-foreground text-base">{vehicle.year}</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-card-foreground opacity-80 font-semibold text-base">Fuel Type:</span>
            <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 font-semibold text-sm px-3 py-1">
              {vehicle.fuel_type?.replace('_', ' ')}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-card-foreground opacity-80 font-semibold text-base">Status:</span>
            <Badge 
              className={`font-bold text-sm px-3 py-1 ${
                vehicle.status === 'active' 
                  ? 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30' 
                  : vehicle.status === 'maintenance' 
                  ? 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30' 
                  : 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30'
              }`}
            >
              {vehicle.status?.replace('_', ' ')}
            </Badge>
          </div>

          {showSubsidiary && subsidiaryInfo && (
            <div className="flex justify-between items-center">
              <span className="text-card-foreground opacity-80 font-semibold text-base">Subsidiary:</span>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="font-bold text-card-foreground text-sm">
                  {subsidiaryInfo.subsidiary_name}
                </span>
              </div>
            </div>
          )}

          {vehicle.drivers?.name && (
            <div className="flex justify-between items-center">
              <span className="text-card-foreground opacity-80 font-semibold text-base">Default Driver:</span>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-bold text-card-foreground text-sm">{vehicle.drivers.name}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t-2 border-border">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 h-12 font-bold text-base bg-card border-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
            onClick={() => onEdit(vehicle)}
          >
            <Edit className="h-5 w-5 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="flex-1 h-12 font-bold text-base bg-red-500 hover:bg-red-600 text-white transition-all duration-200"
            onClick={() => onDelete(vehicle)}
          >
            <Trash2 className="h-5 w-5 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
