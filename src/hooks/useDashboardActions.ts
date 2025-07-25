import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Fuel, 
  Car, 
  Wrench, 
  FileText, 
  Users, 
  Building2,
  Receipt,
  BarChart3
} from 'lucide-react';

export function useDashboardActions() {
  const { profile, hasPermission } = useAuth();
  const navigate = useNavigate();

  const actions = [];

  // Fuel logging - available to fuel_manager and above
  if (hasPermission('fuel_manager')) {
    actions.push({
      icon: Fuel,
      label: 'Add Fuel Log',
      onClick: () => navigate('/fuel-log')
    });
  }

  // Service tickets - available to manager and above
  if (hasPermission('manager')) {
    actions.push({
      icon: Wrench,
      label: 'Create Service Ticket',
      onClick: () => navigate('/service-tickets')
    });
  }

  // Vehicle management - available to manager and above
  if (hasPermission('manager')) {
    actions.push({
      icon: Car,
      label: 'Add Vehicle',
      onClick: () => navigate('/vehicles')
    });
  }

  // Driver management - available to manager and above
  if (hasPermission('manager')) {
    actions.push({
      icon: Users,
      label: 'Add Driver',
      onClick: () => navigate('/drivers')
    });
  }

  // Tank refills - available to fuel_manager and above
  if (hasPermission('fuel_manager')) {
    actions.push({
      icon: Receipt,
      label: 'Record Tank Refill',
      onClick: () => navigate('/tank-refills')
    });
  }

  // Document upload - available to manager and above
  if (hasPermission('manager')) {
    actions.push({
      icon: FileText,
      label: 'Upload Document',
      onClick: () => navigate('/documents')
    });
  }

  // Subsidiary management - available to admin only
  if (hasPermission('admin')) {
    actions.push({
      icon: Building2,
      label: 'Add Subsidiary',
      onClick: () => navigate('/subsidiaries')
    });
  }

  // Reports - available to manager and above
  if (hasPermission('manager')) {
    actions.push({
      icon: BarChart3,
      label: 'Generate Report',
      onClick: () => navigate('/reports')
    });
  }

  return actions;
}