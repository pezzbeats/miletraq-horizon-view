import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Wrench, Calendar, DollarSign, Camera, Package, AlertTriangle } from 'lucide-react';
import { MaintenanceRecord } from '@/pages/Maintenance';

interface MobileMaintenanceCardProps {
  record: MaintenanceRecord;
  onEdit: (record: MaintenanceRecord) => void;
  onCardClick?: (record: MaintenanceRecord) => void;
}

export function MobileMaintenanceCard({ 
  record, 
  onEdit, 
  onCardClick 
}: MobileMaintenanceCardProps) {
  const getMaintenanceTypeBadge = (type: string) => {
    const variants = {
      breakdown: 'destructive',
      scheduled: 'default',
      preventive: 'secondary'
    } as const;
    
    return (
      <Badge variant={variants[type as keyof typeof variants] || 'outline'} className="text-xs">
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-IN');
    }
  };

  const hasPartsUsed = record.maintenance_parts_used && record.maintenance_parts_used.length > 0;
  const partsCost = hasPartsUsed 
    ? record.maintenance_parts_used!.reduce((sum, part) => sum + part.total_cost, 0)
    : 0;

  return (
    <Card 
      className="mobile-maintenance-card hover:shadow-md transition-all duration-200 active:scale-98 cursor-pointer"
      onClick={() => onCardClick?.(record)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <Wrench className="h-5 w-5 text-primary flex-shrink-0" />
              <CardTitle className="text-base font-bold truncate">
                {getMaintenanceTypeBadge(record.maintenance_type)}
              </CardTitle>
              {record.maintenance_type === 'breakdown' && (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {record.vehicles?.vehicle_number}
                </span>
                <span className="text-xs text-muted-foreground flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(record.maintenance_date)}
                </span>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {record.vehicles?.make} {record.vehicles?.model}
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
        {/* Description */}
        <div>
          <p className="text-sm font-medium line-clamp-2">{record.description}</p>
        </div>

        {/* Cost Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium">{formatCurrency(record.total_cost)}</p>
              <p className="text-xs text-muted-foreground">Total Cost</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Wrench className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium">{formatCurrency(record.labor_cost)}</p>
              <p className="text-xs text-muted-foreground">Labor</p>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="border-t pt-3 space-y-2">
          {record.odometer_reading && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Odometer:</span>
              <span className="font-medium">{record.odometer_reading.toLocaleString('en-IN')} km</span>
            </div>
          )}
          
          {hasPartsUsed && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center">
                <Package className="h-3 w-3 mr-1" />
                Parts ({record.maintenance_parts_used!.length}):
              </span>
              <span className="font-medium">{formatCurrency(partsCost)}</span>
            </div>
          )}
          
          {record.vendors?.name && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Vendor:</span>
              <span className="font-medium truncate max-w-32">{record.vendors.name}</span>
            </div>
          )}

          {record.photo_url && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center">
                <Camera className="h-3 w-3 mr-1" />
                Photos:
              </span>
              <Badge variant="outline" className="text-xs">Available</Badge>
            </div>
          )}
        </div>

        {/* Parts Used List */}
        {hasPartsUsed && (
          <div className="border-t pt-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Parts Used:</p>
            <div className="space-y-1">
              {record.maintenance_parts_used!.slice(0, 2).map((part, index) => (
                <div key={part.id} className="flex justify-between text-xs">
                  <span className="truncate">{part.parts_master.name}</span>
                  <span>{part.quantity}x {formatCurrency(part.unit_cost)}</span>
                </div>
              ))}
              {record.maintenance_parts_used!.length > 2 && (
                <p className="text-xs text-muted-foreground">
                  +{record.maintenance_parts_used!.length - 2} more items
                </p>
              )}
            </div>
          </div>
        )}

        {/* Edit Button */}
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full touch-target"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(record);
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Record
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}