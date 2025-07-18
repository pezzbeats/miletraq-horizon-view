import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SuperAdminDashboard } from '@/components/dashboard/SuperAdminDashboard';
import { SubsidiaryAdminDashboard } from '@/components/dashboard/SubsidiaryAdminDashboard';
import { FuelManagerDashboard } from '@/components/dashboard/FuelManagerDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Building2 } from 'lucide-react';

interface FilterState {
  dateRange: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'this_month' | 'last_month' | 'custom';
  customDateFrom?: Date;
  customDateTo?: Date;
  vehicles: string[];
  drivers: string[];
  costCategories: string[];
  status: 'all' | 'active' | 'inactive' | 'maintenance';
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'last_30_days',
    vehicles: [],
    drivers: [],
    costCategories: [],
    status: 'all'
  });

  // Role-based dashboard routing
  const getDashboardComponent = () => {
    if (!profile) {
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground">Please log in to access the dashboard</p>
          </CardContent>
        </Card>
      );
    }

    // Super Admin Dashboard - Cross-subsidiary overview
    if (profile.is_super_admin) {
      return (
        <SuperAdminDashboard 
          filters={filters} 
          onFiltersChange={setFilters}
        />
      );
    }

    // Role-based dashboard selection
    switch (profile.role) {
      case 'admin':
        return (
          <SubsidiaryAdminDashboard 
            filters={filters} 
            onFiltersChange={setFilters}
          />
        );
      
      case 'manager':
        return (
          <SubsidiaryAdminDashboard 
            filters={filters} 
            onFiltersChange={setFilters}
          />
        );
      
      case 'fuel_manager':
        return (
          <FuelManagerDashboard 
            filters={filters} 
            onFiltersChange={setFilters}
          />
        );
      
      case 'viewer':
        return (
          <SubsidiaryAdminDashboard 
            filters={filters} 
            onFiltersChange={setFilters}
          />
        );
      
      default:
        return (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Dashboard Not Available</h3>
              <p className="text-muted-foreground">
                Your role ({profile.role}) does not have access to a dashboard
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return getDashboardComponent();
}