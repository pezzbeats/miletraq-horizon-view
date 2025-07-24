
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
    <Card className="relative bg-white border-l-4 border-l-green-500 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-100 to-green-50 rounded-xl border border-green-200 shadow-md">
              <Car className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-800">{vehicle.vehicle_number}</h3>
              {vehicle.vehicle_name && (
                <p className="text-base text-gray-600 font-medium">{vehicle.vehicle_name}</p>
              )}
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full shadow-sm ${getStatusColor(vehicle.status)}`} />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-semibold text-base">Make & Model:</span>
            <span className="font-bold text-gray-800 text-base">{vehicle.make} {vehicle.model}</span>
          </div>
          
          {vehicle.year && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-semibold text-base">Year:</span>
              <span className="font-bold text-gray-800 text-base">{vehicle.year}</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-semibold text-base">Fuel Type:</span>
            <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 font-semibold text-sm px-3 py-1">
              {vehicle.fuel_type?.replace('_', ' ')}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-semibold text-base">Status:</span>
            <Badge 
              className={`font-bold text-sm px-3 py-1 ${
                vehicle.status === 'active' 
                  ? 'bg-green-100 text-green-700 border-green-200' 
                  : vehicle.status === 'maintenance' 
                  ? 'bg-red-100 text-red-700 border-red-200' 
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              }`}
            >
              {vehicle.status?.replace('_', ' ')}
            </Badge>
          </div>

          {showSubsidiary && subsidiaryInfo && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-semibold text-base">Subsidiary:</span>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span className="font-bold text-gray-800 text-sm">
                  {subsidiaryInfo.subsidiary_name}
                </span>
              </div>
            </div>
          )}

          {vehicle.drivers?.name && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-semibold text-base">Default Driver:</span>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-bold text-gray-800 text-sm">{vehicle.drivers.name}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 h-12 font-bold text-base bg-white border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
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
