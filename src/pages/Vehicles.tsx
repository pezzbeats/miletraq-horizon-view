
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSubsidiary } from '@/contexts/SubsidiaryContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { VehicleDialog } from '@/components/vehicles/VehicleDialog';
import { DeleteVehicleDialog } from '@/components/vehicles/DeleteVehicleDialog';
import { VehicleFilters } from '@/components/vehicles/VehicleFilters';
import { MobileVehicleCard } from '@/components/vehicles/MobileVehicleCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Car, Building2, Globe } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Vehicles() {
  const { currentSubsidiary, allSubsidiariesView, subsidiaries } = useSubsidiary();
  const isMobile = useIsMobile();
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingVehicle, setDeletingVehicle] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    fuelType: 'all',
    make: 'all'
  });

  const { data: vehicles, isLoading, refetch } = useQuery({
    queryKey: ['vehicles', currentSubsidiary?.id, allSubsidiariesView],
    queryFn: async () => {
      let query = supabase
        .from('vehicles')
        .select(`
          *,
          subsidiaries!inner(id, subsidiary_name, subsidiary_code),
          drivers(id, name)
        `)
        .order('vehicle_number');

      // Apply subsidiary filtering
      if (allSubsidiariesView) {
        // Get all vehicles from accessible subsidiaries
        const subsidiaryIds = subsidiaries.map(sub => sub.id);
        if (subsidiaryIds.length > 0) {
          query = query.in('subsidiary_id', subsidiaryIds);
        }
      } else if (currentSubsidiary) {
        query = query.eq('subsidiary_id', currentSubsidiary.id);
      } else {
        // No subsidiary selected, return empty array
        return [];
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!(allSubsidiariesView || currentSubsidiary)
  });

  const filteredVehicles = vehicles?.filter(vehicle => {
    const matchesSearch = 
      vehicle.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vehicle_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filters.status === 'all' || vehicle.status === filters.status;
    const matchesFuelType = filters.fuelType === 'all' || vehicle.fuel_type === filters.fuelType;
    const matchesMake = filters.make === 'all' || vehicle.make === filters.make;

    return matchesSearch && matchesStatus && matchesFuelType && matchesMake;
  }) || [];

  const handleEdit = (vehicle: any) => {
    setEditingVehicle(vehicle);
    setVehicleDialogOpen(true);
  };

  const handleDelete = (vehicle: any) => {
    setDeletingVehicle(vehicle);
    setDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setVehicleDialogOpen(false);
    setEditingVehicle(null);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setDeletingVehicle(null);
  };

  const handleSuccess = () => {
    refetch();
    toast({
      title: 'Success',
      description: editingVehicle ? 'Vehicle updated successfully' : 'Vehicle created successfully',
    });
  };

  const handleDeleteSuccess = () => {
    refetch();
    toast({
      title: 'Success',
      description: 'Vehicle deleted successfully',
    });
  };

  const getSubsidiaryInfo = (subsidiaryId: string) => {
    return subsidiaries.find(sub => sub.id === subsidiaryId);
  };

  if (!allSubsidiariesView && !currentSubsidiary) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Subsidiary Selected</h3>
            <p className="text-muted-foreground">
              Please select a subsidiary to view vehicles
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-4 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Vehicles</h1>
            {allSubsidiariesView && (
              <Badge variant="secondary" className="text-xs">
                <Globe className="h-3 w-3 mr-1" />
                All Subsidiaries
              </Badge>
            )}
          </div>
          <Button size="sm" onClick={() => setVehicleDialogOpen(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <VehicleFilters filters={filters} onFiltersChange={setFilters} />

        {/* Vehicle Cards */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))
          ) : filteredVehicles.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Car className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No vehicles found</p>
              </CardContent>
            </Card>
          ) : (
            filteredVehicles.map((vehicle) => (
              <MobileVehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onEdit={handleEdit}
                onDelete={handleDelete}
                showSubsidiary={allSubsidiariesView}
                subsidiaryInfo={allSubsidiariesView ? getSubsidiaryInfo(vehicle.subsidiary_id) : undefined}
              />
            ))
          )}
        </div>

        {/* Dialogs */}
        <VehicleDialog
          open={vehicleDialogOpen}
          onOpenChange={handleDialogClose}
          vehicle={editingVehicle}
          onSuccess={handleSuccess}
          currentSubsidiary={currentSubsidiary}
        />

        <DeleteVehicleDialog
          open={deleteDialogOpen}
          onOpenChange={handleDeleteDialogClose}
          vehicle={deletingVehicle}
          onSuccess={handleDeleteSuccess}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Car className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">Vehicles</h1>
            {allSubsidiariesView ? (
              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                <Globe className="h-4 w-4" />
                Showing vehicles from all accessible subsidiaries
              </p>
            ) : currentSubsidiary && (
              <p className="text-muted-foreground">
                {currentSubsidiary.subsidiary_name} ({currentSubsidiary.subsidiary_code})
              </p>
            )}
          </div>
        </div>
        <Button onClick={() => setVehicleDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <VehicleFilters filters={filters} onFiltersChange={setFilters} />
        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {filteredVehicles.length} Vehicle{filteredVehicles.length !== 1 ? 's' : ''}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center py-12">
              <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
              <p className="text-muted-foreground mb-4">
                {vehicles?.length === 0 
                  ? "Get started by adding your first vehicle"
                  : "Try adjusting your search or filters"
                }
              </p>
              {vehicles?.length === 0 && (
                <Button onClick={() => setVehicleDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vehicle
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Make & Model</TableHead>
                  <TableHead>Fuel Type</TableHead>
                  <TableHead>Status</TableHead>
                  {allSubsidiariesView && <TableHead>Subsidiary</TableHead>}
                  <TableHead>Default Driver</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{vehicle.vehicle_number}</span>
                        {vehicle.vehicle_name && (
                          <span className="text-sm text-muted-foreground">{vehicle.vehicle_name}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {vehicle.make} {vehicle.model}
                      {vehicle.year && (
                        <span className="text-muted-foreground ml-1">({vehicle.year})</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {vehicle.fuel_type?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={vehicle.status === 'active' ? 'default' : 
                                vehicle.status === 'maintenance' ? 'destructive' : 'secondary'}
                        className="capitalize"
                      >
                        {vehicle.status?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    {allSubsidiariesView && (
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {vehicle.subsidiaries?.subsidiary_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {vehicle.subsidiaries?.subsidiary_code}
                          </span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      {vehicle.drivers?.name || 'Not assigned'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(vehicle)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(vehicle)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <VehicleDialog
        open={vehicleDialogOpen}
        onOpenChange={handleDialogClose}
        vehicle={editingVehicle}
        onSuccess={handleSuccess}
        currentSubsidiary={currentSubsidiary}
      />

      <DeleteVehicleDialog
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogClose}
        vehicle={deletingVehicle}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
