import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash2, User, Phone, Calendar, Car, AlertTriangle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Driver = Tables<'drivers'> & {
  vehicle_count?: number;
  days_to_expiry?: number;
  license_status?: 'valid' | 'expiring' | 'expired';
};

interface MobileDriverCardProps {
  driver: Driver;
  onEdit: (driver: Driver) => void;
  onDelete: (driver: Driver) => void;
  onCardClick?: (driver: Driver) => void;
}

export function MobileDriverCard({ 
  driver, 
  onEdit, 
  onDelete, 
  onCardClick 
}: MobileDriverCardProps) {
  const getLicenseStatusBadge = (status: string, daysToExpiry?: number) => {
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
    let text = status;
    
    if (status === 'expired') {
      variant = 'destructive';
      text = 'Expired';
    } else if (status === 'expiring') {
      variant = 'secondary';
      text = `Expires in ${daysToExpiry} days`;
    } else {
      variant = 'default';
      text = 'Valid';
    }
    
    return (
      <Badge variant={variant} className="text-xs">
        {text}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'secondary'} className="text-xs">
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const formatLicenseExpiry = (expiry: string | null) => {
    if (!expiry) return 'Not set';
    
    const expiryDate = new Date(expiry);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Expired ${Math.abs(diffDays)} days ago`;
    } else if (diffDays <= 30) {
      return `Expires in ${diffDays} days`;
    } else {
      return expiryDate.toLocaleDateString('en-IN');
    }
  };

  return (
    <Card 
      className="mobile-driver-card hover:shadow-md transition-all duration-200 active:scale-98 cursor-pointer"
      onClick={() => onCardClick?.(driver)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-bold truncate">
                  {driver.name}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusBadge(driver.is_active)}
                  {driver.license_status && (
                    <>
                      {driver.license_status === 'expired' && (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      )}
                      {getLicenseStatusBadge(driver.license_status, driver.days_to_expiry)}
                    </>
                  )}
                </div>
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
        {/* License Information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">License:</span>
            <span className="font-medium truncate max-w-32">
              {driver.license_number || 'Not set'}
            </span>
          </div>
          
          {driver.license_expiry && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Expires:
              </span>
              <span className="font-medium text-xs">
                {formatLicenseExpiry(driver.license_expiry)}
              </span>
            </div>
          )}
        </div>

        {/* Contact and Vehicle Info */}
        <div className="border-t pt-3 space-y-2">
          {driver.phone && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{driver.phone}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2 text-sm">
            <Car className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Assigned vehicles:</span>
            <Badge variant="outline" className="text-xs">
              {driver.vehicle_count || 0}
            </Badge>
          </div>
        </div>

        {/* Address */}
        {driver.address && (
          <div className="border-t pt-3">
            <p className="text-xs text-muted-foreground">Address:</p>
            <p className="text-sm font-medium truncate">{driver.address}</p>
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
              onEdit(driver);
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
              onDelete(driver);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}