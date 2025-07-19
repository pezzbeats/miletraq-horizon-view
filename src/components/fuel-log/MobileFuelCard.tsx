import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Fuel, MapPin, DollarSign, Gauge, Calendar } from 'lucide-react';
import { FuelLogEntry } from '@/pages/FuelLog';

interface MobileFuelCardProps {
  entry: FuelLogEntry;
  onEdit: (entry: FuelLogEntry) => void;
  onCardClick?: (entry: FuelLogEntry) => void;
}

export function MobileFuelCard({ 
  entry, 
  onEdit, 
  onCardClick 
}: MobileFuelCardProps) {
  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return 'N/A';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-IN');
    }
  };

  const getFuelTypeBadge = (fuelType: string) => {
    const colors = {
      diesel: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      petrol: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      cng: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    };

    return (
      <Badge className={`capitalize text-xs ${colors[fuelType as keyof typeof colors] || ''}`}>
        {fuelType}
      </Badge>
    );
  };

  return (
    <Card 
      className="mobile-fuel-card hover:shadow-md transition-all duration-200 active:scale-98 cursor-pointer"
      onClick={() => onCardClick?.(entry)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {formatDate(entry.date)}
              </span>
            </div>
            
            <CardTitle className="text-base font-bold flex items-center space-x-2">
              <span>{entry.vehicles?.vehicle_number}</span>
              {entry.vehicles?.fuel_type && getFuelTypeBadge(entry.vehicles.fuel_type)}
            </CardTitle>
            
            <div className="text-sm text-muted-foreground mt-1">
              {entry.vehicles?.make} {entry.vehicles?.model}
              {entry.drivers?.name && (
                <span> • {entry.drivers.name}</span>
              )}
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
        {/* Main Fuel Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Fuel className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium">{entry.fuel_volume}L</p>
              <p className="text-xs text-muted-foreground">Volume</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium">{formatCurrency(entry.total_cost)}</p>
              <p className="text-xs text-muted-foreground">Total Cost</p>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="border-t pt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Rate/Liter:</span>
            <span className="font-medium">{formatCurrency(entry.rate_per_liter)}</span>
          </div>
          
          {entry.odometer_reading && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center">
                <Gauge className="h-3 w-3 mr-1" />
                Odometer:
              </span>
              <span className="font-medium">{entry.odometer_reading.toLocaleString('en-IN')} km</span>
            </div>
          )}
          
          {entry.mileage && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Mileage:</span>
              <span className="font-medium">{entry.mileage.toFixed(1)} km/L</span>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              Source:
            </span>
            <span className="font-medium capitalize">{entry.fuel_source}</span>
          </div>
          
          {entry.vendors?.name && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Vendor:</span>
              <span className="font-medium truncate max-w-32">{entry.vendors.name}</span>
            </div>
          )}
        </div>

        {/* Edit Button */}
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full touch-target"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(entry);
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Entry
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}