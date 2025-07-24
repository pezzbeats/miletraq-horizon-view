
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
    <Card className="relative bg-card/95 backdrop-blur-sm border-border/50 shadow-lg transition-colors duration-300">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/15 rounded-lg backdrop-blur-sm border border-primary/20">
              <Car className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">{vehicle.vehicle_number}</h3>
              {vehicle.vehicle_name && (
                <p className="text-sm text-muted-foreground">{vehicle.vehicle_name}</p>
              )}
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full shadow-sm ${getStatusColor(vehicle.status)}`} />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Make & Model:</span>
            <span className="font-semibold text-foreground">{vehicle.make} {vehicle.model}</span>
          </div>
          
          {vehicle.year && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">Year:</span>
              <span className="font-semibold text-foreground">{vehicle.year}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Fuel Type:</span>
            <Badge variant="outline" className="text-xs capitalize bg-card/50 border-border text-foreground">
              {vehicle.fuel_type?.replace('_', ' ')}
            </Badge>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Status:</span>
            <Badge 
              variant={vehicle.status === 'active' ? 'default' : 
                      vehicle.status === 'maintenance' ? 'destructive' : 'secondary'}
              className="text-xs capitalize font-medium"
            >
              {vehicle.status?.replace('_', ' ')}
            </Badge>
          </div>

          {showSubsidiary && subsidiaryInfo && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">Subsidiary:</span>
              <div className="flex items-center gap-1">
                <Building2 className="h-3 w-3 text-foreground" />
                <span className="font-semibold text-foreground text-xs">
                  {subsidiaryInfo.subsidiary_name}
                </span>
              </div>
            </div>
          )}

          {vehicle.drivers?.name && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">Default Driver:</span>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3 text-foreground" />
                <span className="font-semibold text-foreground text-xs">{vehicle.drivers.name}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-3 border-t border-border/30">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 h-11 font-medium border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
            onClick={() => onEdit(vehicle)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="flex-1 h-11 font-medium hover:bg-destructive/90 transition-all duration-200"
            onClick={() => onDelete(vehicle)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
