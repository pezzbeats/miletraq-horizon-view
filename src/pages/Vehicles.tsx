import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { VehicleDialog } from '@/components/vehicles/VehicleDialog';
import { DeleteVehicleDialog } from '@/components/vehicles/DeleteVehicleDialog';
import { VehicleFilters } from '@/components/vehicles/VehicleFilters';
import { Tables } from '@/integrations/supabase/types';
import { useIsMobile } from '@/hooks/use-mobile'; // Fixed mobile hook import

type Vehicle = Tables<'vehicles'> & {
  default_driver?: {
    name: string;
  } | null;
  subsidiary?: {
    subsidiary_name: string;
    business_type: string;
  } | null;
};

interface Filters {
  subsidiary: string;
  status: string;
  fuelType: string;
  make: string;
}

const Vehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [subsidiaries, setSubsidiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Filters>({
    subsidiary: '',
    status: '',
    fuelType: '',
    make: '',
  });
  const [sortBy, setSortBy] = useState<keyof Vehicle>('vehicle_number');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchVehicles();
    fetchSubsidiaries();
  }, []);

  const fetchSubsidiaries = async () => {
    try {
      const { data, error } = await supabase
        .from('subsidiaries')
        .select('*')
        .eq('is_active', true)
        .order('subsidiary_name');

      if (error) throw error;
      setSubsidiaries(data || []);
    } catch (error) {
      console.error('Error fetching subsidiaries:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          default_driver:drivers(name),
          subsidiary:subsidiaries(subsidiary_name, business_type)
        `)
        .order('vehicle_name', { ascending: true });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load vehicles. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: keyof Vehicle) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const filteredVehicles = vehicles
    .filter(vehicle => {
      const matchesSearch = 
        vehicle.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.default_driver?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        '';

      const matchesStatus = !filters.status || vehicle.status === filters.status;
      const matchesFuelType = !filters.fuelType || vehicle.fuel_type === filters.fuelType;
      const matchesMake = !filters.make || vehicle.make.toLowerCase().includes(filters.make.toLowerCase());

      return matchesSearch && matchesStatus && matchesFuelType && matchesMake;
    })
    .sort((a, b) => {
      const aValue = a[sortBy] as string | number;
      const bValue = b[sortBy] as string | number;
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDialogOpen(true);
  };

  const handleDelete = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedVehicle(null);
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'active' ? 'default' : 
                   status === 'inactive' ? 'secondary' : 
                   status === 'maintenance' ? 'destructive' : 'outline';
    
    return (
      <Badge variant={variant} className="capitalize">
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
      <Badge className={`capitalize ${colors[fuelType as keyof typeof colors] || ''}`}>
        {fuelType}
      </Badge>
    );
  };

  const EmptyState = () => (
    <Card className="text-center py-12">
      <CardContent>
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Plus className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
        <p className="text-muted-foreground mb-4">
          {searchTerm || Object.values(filters).some(f => f) 
            ? 'No vehicles match your search criteria. Try adjusting your filters.'
            : 'Start by adding your first vehicle to the fleet.'
          }
        </p>
        {!searchTerm && !Object.values(filters).some(f => f) && (
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Vehicle
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vehicles Master</h1>
          <p className="text-muted-foreground">Manage your fleet vehicles</p>
        </div>
        {!isMobile && (
          <Button onClick={handleAdd} className="w-fit">
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search vehicles by number, make, model, or driver..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <VehicleFilters 
              filters={filters}
              onFiltersChange={setFilters}
              vehicles={vehicles}
              subsidiaries={subsidiaries}
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {vehicles.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredVehicles.length} of {vehicles.length} vehicles
        </div>
      )}

      {/* Data Table */}
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p>Loading vehicles...</p>
          </CardContent>
        </Card>
      ) : filteredVehicles.length === 0 ? (
        <EmptyState />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                     <th 
                      className="text-left p-4 font-medium cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => handleSort('vehicle_name')}
                    >
                      Vehicle Name {sortBy === 'vehicle_name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-left p-4 font-medium cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => handleSort('vehicle_number')}
                    >
                      Vehicle Number {sortBy === 'vehicle_number' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-left p-4 font-medium cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => handleSort('make')}
                    >
                      Make {sortBy === 'make' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-left p-4 font-medium cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => handleSort('model')}
                    >
                      Model {sortBy === 'model' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-left p-4 font-medium hidden sm:table-cell">Year</th>
                    <th className="text-left p-4 font-medium">Fuel Type</th>
                    <th className="text-left p-4 font-medium hidden lg:table-cell">Default Driver</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-center p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((vehicle) => (
                     <tr key={vehicle.id} className="border-b hover:bg-muted/20 transition-colors">
                       <td className="p-4 font-bold text-lg">{vehicle.vehicle_name || 'Unnamed'}</td>
                       <td className="p-4 font-medium">{vehicle.vehicle_number}</td>
                       <td className="p-4">{vehicle.make}</td>
                      <td className="p-4">{vehicle.model}</td>
                      <td className="p-4 hidden sm:table-cell">{vehicle.year || '-'}</td>
                      <td className="p-4">{getFuelTypeBadge(vehicle.fuel_type)}</td>
                      <td className="p-4 hidden lg:table-cell">
                        {vehicle.default_driver?.name || 'Not assigned'}
                      </td>
                      <td className="p-4">{getStatusBadge(vehicle.status || 'active')}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(vehicle)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(vehicle)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile FAB */}
      {isMobile && (
        <Button
          onClick={handleAdd}
          className="fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      )}

      {/* Dialogs */}
      <VehicleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        vehicle={selectedVehicle}
        onSuccess={fetchVehicles}
      />

      <DeleteVehicleDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        vehicle={vehicleToDelete}
        onSuccess={fetchVehicles}
      />
    </div>
  );
};

export default Vehicles;
