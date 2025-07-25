import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Users, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { useSubsidiary } from '@/contexts/SubsidiaryContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { DriversTable } from '@/components/drivers/DriversTable';
import { DriverDialog } from '@/components/drivers/DriverDialog';
import { DeleteDriverDialog } from '@/components/drivers/DeleteDriverDialog';
import { MobileDriverCard } from '@/components/drivers/MobileDriverCard';

type Driver = Tables<'drivers'> & {
  vehicle_count?: number;
  days_to_expiry?: number;
  license_status?: 'valid' | 'expiring' | 'expired';
};

const Drivers = () => {
  const { currentSubsidiary, allSubsidiariesView } = useSubsidiary();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [licenseStatusFilter, setLicenseStatusFilter] = useState<string>('all');
  const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      
      // Fetch drivers with subsidiary filtering
      let query = supabase
        .from('drivers')
        .select('*');

      // Apply subsidiary filtering
      if (!allSubsidiariesView && currentSubsidiary) {
        query = query.eq('subsidiary_id', currentSubsidiary.id);
      }

      const { data: driversData, error: driversError } = await query.order('name');

      if (driversError) throw driversError;

      // Fetch vehicle counts for each driver
      const driversWithCounts = await Promise.all(
        (driversData || []).map(async (driver) => {
          const { count, error: countError } = await supabase
            .from('vehicles')
            .select('*', { count: 'exact', head: true })
            .eq('default_driver_id', driver.id);

          if (countError) {
            console.error('Error counting vehicles for driver:', driver.id, countError);
          }

          let daysToExpiry: number | undefined;
          let licenseStatus: 'valid' | 'expiring' | 'expired' = 'valid';

          if (driver.license_expiry) {
            const expiryDate = new Date(driver.license_expiry);
            const today = new Date();
            const diffTime = expiryDate.getTime() - today.getTime();
            daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (daysToExpiry < 0) {
              licenseStatus = 'expired';
            } else if (daysToExpiry <= 30) {
              licenseStatus = 'expiring';
            }
          }

          return {
            ...driver,
            vehicle_count: count || 0,
            days_to_expiry: daysToExpiry,
            license_status: licenseStatus
          };
        })
      );

      setDrivers(driversWithCounts);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch drivers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [currentSubsidiary, allSubsidiariesView]);

  useEffect(() => {
    let filtered = drivers;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(driver =>
        driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (driver.license_number && driver.license_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (driver.phone && driver.phone.includes(searchQuery))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(driver => 
        statusFilter === 'active' ? driver.is_active : !driver.is_active
      );
    }

    // License status filter
    if (licenseStatusFilter !== 'all') {
      filtered = filtered.filter(driver => driver.license_status === licenseStatusFilter);
    }

    setFilteredDrivers(filtered);
  }, [drivers, searchQuery, statusFilter, licenseStatusFilter]);

  const handleAddDriver = () => {
    setSelectedDriver(null);
    setIsDriverDialogOpen(true);
  };

  const handleEditDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsDriverDialogOpen(true);
  };

  const handleDeleteDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsDeleteDialogOpen(true);
  };

  const handleDriverSaved = () => {
    setIsDriverDialogOpen(false);
    setSelectedDriver(null);
    fetchDrivers();
  };

  const handleDriverDeleted = () => {
    setIsDeleteDialogOpen(false);
    setSelectedDriver(null);
    fetchDrivers();
  };

  const getStatusCounts = () => {
    const total = drivers.length;
    const active = drivers.filter(d => d.is_active).length;
    const expiring = drivers.filter(d => d.license_status === 'expiring').length;
    const expired = drivers.filter(d => d.license_status === 'expired').length;
    
    return { total, active, expiring, expired };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Drivers Master</h1>
            {allSubsidiariesView && (
              <Badge variant="secondary" className="text-xs">
                <Globe className="h-3 w-3 mr-1" />
                All Subsidiaries
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {allSubsidiariesView 
              ? "Manage drivers and track license compliance across all subsidiaries"
              : currentSubsidiary 
                ? `Manage drivers for ${currentSubsidiary.subsidiary_name}`
                : "Manage drivers and track license compliance"
            }
          </p>
        </div>
        {!isMobile && (
          <Button onClick={handleAddDriver} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Driver
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <div className="h-2 w-2 rounded-full bg-orange-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.expiring}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.expired}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter drivers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, license number, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={licenseStatusFilter} onValueChange={setLicenseStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="License status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Licenses</SelectItem>
                <SelectItem value="valid">Valid</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Drivers Display - Mobile Cards or Desktop Table */}
      {filteredDrivers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {drivers.length === 0 ? 'No drivers found' : 'No matching drivers'}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {drivers.length === 0 
                ? 'Add your first driver to start managing licenses'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {drivers.length === 0 && (
              <Button onClick={handleAddDriver} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add First Driver
              </Button>
            )}
          </CardContent>
        </Card>
      ) : isMobile ? (
        /* Mobile Card Layout */
        <div className="grid grid-cols-1 gap-4">
          {filteredDrivers.map((driver) => (
            <MobileDriverCard
              key={driver.id}
              driver={driver}
              onEdit={handleEditDriver}
              onDelete={handleDeleteDriver}
            />
          ))}
        </div>
      ) : (
        /* Desktop Table Layout */
        <DriversTable
          drivers={filteredDrivers}
          onEdit={handleEditDriver}
          onDelete={handleDeleteDriver}
        />
      )}

      {/* Mobile FAB */}
      {isMobile && (
        <Button
          onClick={handleAddDriver}
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Dialogs */}
      <DriverDialog
        driver={selectedDriver}
        open={isDriverDialogOpen}
        onOpenChange={setIsDriverDialogOpen}
        onSave={handleDriverSaved}
      />

      <DeleteDriverDialog
        driver={selectedDriver}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDriverDeleted}
      />
    </div>
  );
};

export default Drivers;