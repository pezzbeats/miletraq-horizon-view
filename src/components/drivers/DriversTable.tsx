import React from 'react';
import { Edit, Trash2, Phone, Calendar, Car, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tables } from '@/integrations/supabase/types';
import { format } from 'date-fns';

type Driver = Tables<'drivers'> & {
  vehicle_count?: number;
  days_to_expiry?: number;
  license_status?: 'valid' | 'expiring' | 'expired';
};

interface DriversTableProps {
  drivers: Driver[];
  onEdit: (driver: Driver) => void;
  onDelete: (driver: Driver) => void;
}

export const DriversTable: React.FC<DriversTableProps> = ({
  drivers,
  onEdit,
  onDelete,
}) => {
  const isMobile = useIsMobile();

  const getStatusBadge = (driver: Driver) => {
    return (
      <Badge variant={driver.is_active ? "default" : "secondary"}>
        {driver.is_active ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const getLicenseStatusBadge = (driver: Driver) => {
    if (!driver.license_expiry) {
      return <Badge variant="outline">No License</Badge>;
    }

    const { license_status, days_to_expiry } = driver;
    
    if (license_status === 'expired') {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Expired {days_to_expiry ? Math.abs(days_to_expiry) : 0} days ago
        </Badge>
      );
    }
    
    if (license_status === 'expiring') {
      return (
        <Badge variant="outline" className="flex items-center gap-1 border-orange-500 text-orange-600">
          <AlertTriangle className="h-3 w-3" />
          Expires in {days_to_expiry} days
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="border-green-500 text-green-600">
        Valid
      </Badge>
    );
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return format(new Date(date), 'MMM dd, yyyy');
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        {drivers.map((driver) => (
          <Card key={driver.id} className="relative">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{driver.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(driver)}
                    {getLicenseStatusBadge(driver)}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(driver)}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDelete(driver)}
                    className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                {driver.license_number && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>License: {driver.license_number}</span>
                  </div>
                )}
                
                {driver.license_expiry && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Expiry: {formatDate(driver.license_expiry)}</span>
                  </div>
                )}
                
                {driver.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{driver.phone}</span>
                  </div>
                )}
                
                {driver.vehicle_count !== undefined && (
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    <span>{driver.vehicle_count} vehicle(s) assigned</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver Name</TableHead>
                <TableHead>License Number</TableHead>
                <TableHead>License Expiry</TableHead>
                <TableHead>License Status</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vehicles</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{driver.name}</div>
                      {driver.address && (
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {driver.address}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {driver.license_number || '-'}
                  </TableCell>
                  
                  <TableCell>
                    {formatDate(driver.license_expiry)}
                  </TableCell>
                  
                  <TableCell>
                    {getLicenseStatusBadge(driver)}
                  </TableCell>
                  
                  <TableCell>
                    {driver.phone ? (
                      <a 
                        href={`tel:${driver.phone}`}
                        className="text-primary hover:underline"
                      >
                        {driver.phone}
                      </a>
                    ) : '-'}
                  </TableCell>
                  
                  <TableCell>
                    {getStatusBadge(driver)}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span>{driver.vehicle_count || 0}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEdit(driver)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onDelete(driver)}
                        className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};