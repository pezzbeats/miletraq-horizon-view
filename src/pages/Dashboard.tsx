import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubsidiary } from '@/contexts/SubsidiaryContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { SuperAdminDashboard } from '@/components/dashboard/SuperAdminDashboard';
import { SubsidiaryAdminDashboard } from '@/components/dashboard/SubsidiaryAdminDashboard';
import { FuelManagerDashboard } from '@/components/dashboard/FuelManagerDashboard';
import { MobileDashboard } from '@/components/dashboard/MobileDashboard';
import { SubsidiarySelector } from '@/components/subsidiary/SubsidiarySelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const { currentSubsidiary } = useSubsidiary();
  const isMobile = useIsMobile();
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'last_30_days',
    vehicles: [],
    drivers: [],
    costCategories: [],
    status: 'all'
  });

  // Use mobile dashboard on mobile devices
  if (isMobile) {
    return <MobileDashboard />;
  }

  // Desktop dashboard logic remains the same
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

    // Super Admin Dashboard - Cross-subsidiary overview with subsidiary selector
    if (profile.is_super_admin) {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Fleet Dashboard</span>
                <SubsidiarySelector compact />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {currentSubsidiary 
                  ? `Viewing data for ${currentSubsidiary.subsidiary_name}` 
                  : 'Select a subsidiary to view its dashboard data'
                }
              </p>
            </CardContent>
          </Card>
          <SuperAdminDashboard 
            filters={filters} 
            onFiltersChange={setFilters}
          />
        </div>
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
