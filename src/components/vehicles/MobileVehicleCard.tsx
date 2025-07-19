import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash2, Car, Fuel, User, Calendar } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Vehicle = Tables<'vehicles'> & {
  default_driver?: {
    name: string;
  } | null;
  subsidiary?: {
    subsidiary_name: string;
    business_type: string;
  } | null;
};

interface MobileVehicleCardProps {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  onCardClick?: (vehicle: Vehicle) => void;
}

export function MobileVehicleCard({ 
  vehicle, 
  onEdit, 
  onDelete, 
  onCardClick 
}: MobileVehicleCardProps) {
  const getStatusBadge = (status: string) => {
    const variant = status === 'active' ? 'default' : 
                   status === 'inactive' ? 'secondary' : 
                   status === 'maintenance' ? 'destructive' : 'outline';
    
    return (
      <Badge variant={variant} className="capitalize text-xs">
        {status}
      </Badge>
    );
  };

  const getFuelTypeBadge = (fuelType: string) => {
    const colors = {
      diesel: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      petrol: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      cng: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      electric: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    };

    return (
      <Badge className={`capitalize text-xs ${colors[fuelType as keyof typeof colors] || ''}`}>
        {fuelType}
      </Badge>
    );
  };

  return (
    <Card 
      className="mobile-vehicle-card hover:shadow-md transition-all duration-200 active:scale-98 cursor-pointer"
      onClick={() => onCardClick?.(vehicle)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <Car className="h-5 w-5 text-primary flex-shrink-0" />
              <CardTitle className="text-lg font-bold truncate">
                {vehicle.vehicle_name || vehicle.vehicle_number}
              </CardTitle>
              {vehicle.subsidiary && (
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  {vehicle.subsidiary.subsidiary_name}
                </Badge>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {vehicle.vehicle_number}
                </span>
                {getStatusBadge(vehicle.status || 'active')}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{vehicle.make}</span>
                <span>•</span>
                <span>{vehicle.model}</span>
                {vehicle.year && (
                  <>
                    <span>•</span>
                    <span>{vehicle.year}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 touch-target"
            onClick={(e) => {
              e.stopPropagation();
              // Handle options menu
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Fuel Type and Driver Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Fuel className="h-4 w-4 text-muted-foreground" />
            {getFuelTypeBadge(vehicle.fuel_type)}
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium truncate max-w-24">
              {vehicle.default_driver?.name || 'Unassigned'}
            </span>
          </div>
        </div>

        {/* Document Expiry Info */}
        {(vehicle.insurance_expiry || vehicle.rc_expiry || vehicle.puc_expiry || vehicle.permit_expiry) && (
          <div className="border-t pt-3">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Document Status</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {vehicle.insurance_expiry && (
                <div className="flex justify-between">
                  <span>Insurance:</span>
                  <span className="font-medium">
                    {new Date(vehicle.insurance_expiry).toLocaleDateString('en-IN')}
                  </span>
                </div>
              )}
              {vehicle.rc_expiry && (
                <div className="flex justify-between">
                  <span>RC:</span>
                  <span className="font-medium">
                    {new Date(vehicle.rc_expiry).toLocaleDateString('en-IN')}
                  </span>
                </div>
              )}
              {vehicle.puc_expiry && (
                <div className="flex justify-between">
                  <span>PUC:</span>
                  <span className="font-medium">
                    {new Date(vehicle.puc_expiry).toLocaleDateString('en-IN')}
                  </span>
                </div>
              )}
              {vehicle.permit_expiry && (
                <div className="flex justify-between">
                  <span>Permit:</span>
                  <span className="font-medium">
                    {new Date(vehicle.permit_expiry).toLocaleDateString('en-IN')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 touch-target"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(vehicle);
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="touch-target"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(vehicle);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}