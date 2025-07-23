
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
    <Card className="relative">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Car className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{vehicle.vehicle_number}</h3>
              {vehicle.vehicle_name && (
                <p className="text-sm text-muted-foreground">{vehicle.vehicle_name}</p>
              )}
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full ${getStatusColor(vehicle.status)}`} />
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Make & Model:</span>
            <span className="font-medium">{vehicle.make} {vehicle.model}</span>
          </div>
          
          {vehicle.year && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Year:</span>
              <span className="font-medium">{vehicle.year}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Fuel Type:</span>
            <Badge variant="outline" className="text-xs capitalize">
              {vehicle.fuel_type?.replace('_', ' ')}
            </Badge>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status:</span>
            <Badge 
              variant={vehicle.status === 'active' ? 'default' : 
                      vehicle.status === 'maintenance' ? 'destructive' : 'secondary'}
              className="text-xs capitalize"
            >
              {vehicle.status?.replace('_', ' ')}
            </Badge>
          </div>

          {showSubsidiary && subsidiaryInfo && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subsidiary:</span>
              <div className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                <span className="font-medium text-xs">
                  {subsidiaryInfo.subsidiary_name}
                </span>
              </div>
            </div>
          )}

          {vehicle.drivers?.name && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Default Driver:</span>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="font-medium text-xs">{vehicle.drivers.name}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(vehicle)}
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={() => onDelete(vehicle)}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
