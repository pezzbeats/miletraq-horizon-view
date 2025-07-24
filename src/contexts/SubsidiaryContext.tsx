import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

type PermissionLevel = 'full_access' | 'operational_access' | 'read_only_access' | 'fuel_only_access' | 'maintenance_only_access';

interface Subsidiary {
  id: string;
  subsidiary_name: string;
  subsidiary_code: string;
  business_type: 'construction' | 'hospitality' | 'education' | 'other';
  gstin?: string;
  registered_address?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  is_active: boolean;
}

interface SubsidiaryWithPermission extends Subsidiary {
  permission_level?: PermissionLevel;
  user_count?: number;
}

interface SubsidiaryContextType {
  subsidiaries: SubsidiaryWithPermission[];
  currentSubsidiary: SubsidiaryWithPermission | null;
  allSubsidiariesView: boolean;
  setCurrentSubsidiary: (subsidiary: SubsidiaryWithPermission | null) => void;
  setAllSubsidiariesView: (enabled: boolean) => void;
  loading: boolean;
  refreshSubsidiaries: () => Promise<void>;
  canManageSubsidiaries: boolean;
  hasMultipleSubsidiaries: boolean;
  getUserPermissionLevel: (subsidiaryId: string) => PermissionLevel | null;
  canAccessModule: (module: string, subsidiaryId?: string) => boolean;
}

const SubsidiaryContext = createContext<SubsidiaryContextType | undefined>(undefined);

export function SubsidiaryProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [subsidiaries, setSubsidiaries] = useState<SubsidiaryWithPermission[]>([]);
  const [currentSubsidiary, setCurrentSubsidiaryState] = useState<SubsidiaryWithPermission | null>(null);
  const [allSubsidiariesView, setAllSubsidiariesViewState] = useState(false);
  const [loading, setLoading] = useState(true);

  const canManageSubsidiaries = profile?.is_super_admin || profile?.role === 'admin';
  const hasMultipleSubsidiaries = subsidiaries.length > 1;

  useEffect(() => {
    if (profile) {
      fetchSubsidiaries();
    }
  }, [profile]);

  const fetchSubsidiaries = async () => {
    try {
      let subsidiariesWithPermissions: SubsidiaryWithPermission[] = [];
      
      if (profile?.is_super_admin) {
        // Super admin gets access to all subsidiaries with full access
        const { data: allSubsidiaries, error: allError } = await supabase
          .from('subsidiaries')
          .select('*')
          .eq('is_active', true)
          .order('subsidiary_name');
        
        if (allError) throw allError;
        
        subsidiariesWithPermissions = (allSubsidiaries || []).map(sub => ({
          ...sub,
          business_type: sub.business_type as 'construction' | 'hospitality' | 'education' | 'other',
          permission_level: 'full_access' as PermissionLevel
        }));
      } else {
        // Fetch subsidiaries with user permissions
        const { data: permissionsData, error: permissionsError } = await supabase
          .from('user_subsidiary_permissions')
          .select(`
            permission_level,
            subsidiary_id,
            subsidiaries (*)
          `)
          .eq('user_id', profile?.id);

        if (permissionsError) throw permissionsError;

        subsidiariesWithPermissions = (permissionsData || [])
          .filter(perm => perm.subsidiaries && (perm.subsidiaries as any).is_active)
          .map(perm => {
            const sub = perm.subsidiaries as any;
            return {
              ...sub,
              business_type: sub.business_type as 'construction' | 'hospitality' | 'education' | 'other',
              permission_level: perm.permission_level as PermissionLevel
            };
          });
      }

      setSubsidiaries(subsidiariesWithPermissions);

      // Set default subsidiary if not already set
      if (subsidiariesWithPermissions && subsidiariesWithPermissions.length > 0 && !currentSubsidiary && !allSubsidiariesView) {
        const savedSubsidiaryId = localStorage.getItem('selectedSubsidiary');
        const savedAllView = localStorage.getItem('allSubsidiariesView') === 'true';
        
        // Enable "All Subsidiaries" view for users with multiple subsidiaries (not just super admins)
        if (savedAllView && subsidiariesWithPermissions.length > 1) {
          setAllSubsidiariesViewState(true);
        } else {
          let defaultSub = subsidiariesWithPermissions.find(sub => sub.id === profile?.default_subsidiary_id);
          if (!defaultSub && savedSubsidiaryId) {
            defaultSub = subsidiariesWithPermissions.find(sub => sub.id === savedSubsidiaryId);
          }
          if (!defaultSub) {
            defaultSub = subsidiariesWithPermissions[0];
          }
          
          setCurrentSubsidiaryState(defaultSub);
          localStorage.setItem('selectedSubsidiary', defaultSub.id);
        }
      }
    } catch (error) {
      console.error('Error fetching subsidiaries:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subsidiaries',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const setCurrentSubsidiary = (subsidiary: SubsidiaryWithPermission | null) => {
    if (subsidiary === null) {
      // This means switch to "All Subsidiaries" view
      setAllSubsidiariesViewState(true);
      setCurrentSubsidiaryState(null);
      localStorage.setItem('allSubsidiariesView', 'true');
      localStorage.removeItem('selectedSubsidiary');
      toast({
        title: 'View Changed',
        description: 'Switched to All Subsidiaries view',
      });
    } else {
      setCurrentSubsidiaryState(subsidiary);
      setAllSubsidiariesViewState(false);
      localStorage.setItem('selectedSubsidiary', subsidiary.id);
      localStorage.removeItem('allSubsidiariesView');
      toast({
        title: 'Subsidiary Changed',
        description: `Switched to ${subsidiary.subsidiary_name}`,
      });
    }
  };

  const setAllSubsidiariesView = (enabled: boolean) => {
    if (enabled) {
      setCurrentSubsidiary(null);
    } else if (subsidiaries.length > 0) {
      const defaultSub = subsidiaries.find(sub => sub.id === profile?.default_subsidiary_id) || subsidiaries[0];
      setCurrentSubsidiary(defaultSub);
    }
  };

  const getUserPermissionLevel = (subsidiaryId: string): PermissionLevel | null => {
    if (profile?.is_super_admin) return 'full_access';
    const subsidiary = subsidiaries.find(sub => sub.id === subsidiaryId);
    return subsidiary?.permission_level || null;
  };

  const canAccessModule = (module: string, subsidiaryId?: string): boolean => {
    const targetSubsidiary = subsidiaryId || currentSubsidiary?.id;
    if (!targetSubsidiary) return allSubsidiariesView; // In all subsidiaries view, allow read access
    
    const permission = getUserPermissionLevel(targetSubsidiary);
    if (!permission) return false;
    
    // Define module access rules based on permission levels
    const moduleAccessRules: Record<string, PermissionLevel[]> = {
      'dashboard': ['full_access', 'operational_access', 'read_only_access', 'fuel_only_access', 'maintenance_only_access'],
      'vehicles': ['full_access', 'operational_access', 'read_only_access'],
      'drivers': ['full_access', 'operational_access', 'read_only_access'],
      'fuel': ['full_access', 'operational_access', 'fuel_only_access'],
      'maintenance': ['full_access', 'operational_access', 'maintenance_only_access'],
      'analytics': ['full_access', 'operational_access', 'read_only_access'],
      'budget': ['full_access', 'operational_access'],
      'settings': ['full_access'],
      'users': ['full_access']
    };
    
    const allowedPermissions = moduleAccessRules[module] || ['full_access'];
    return allowedPermissions.includes(permission);
  };

  // Load saved view state from localStorage on mount
  useEffect(() => {
    const savedAllView = localStorage.getItem('allSubsidiariesView') === 'true';
    const savedSubsidiaryId = localStorage.getItem('selectedSubsidiary');
    
    if (subsidiaries.length > 0) {
      if (savedAllView && hasMultipleSubsidiaries) {
        setAllSubsidiariesViewState(true);
        setCurrentSubsidiaryState(null);
      } else if (savedSubsidiaryId) {
        const savedSubsidiary = subsidiaries.find(sub => sub.id === savedSubsidiaryId);
        if (savedSubsidiary) {
          setCurrentSubsidiaryState(savedSubsidiary);
          setAllSubsidiariesViewState(false);
        }
      }
    }
  }, [subsidiaries, hasMultipleSubsidiaries]);

  const refreshSubsidiaries = async () => {
    await fetchSubsidiaries();
  };

  const value = {
    subsidiaries,
    currentSubsidiary,
    allSubsidiariesView,
    setCurrentSubsidiary,
    setAllSubsidiariesView,
    loading,
    refreshSubsidiaries,
    canManageSubsidiaries,
    hasMultipleSubsidiaries,
    getUserPermissionLevel,
    canAccessModule,
  };

  return (
    <SubsidiaryContext.Provider value={value}>
      {children}
    </SubsidiaryContext.Provider>
  );
}

export function useSubsidiary() {
  const context = useContext(SubsidiaryContext);
  if (context === undefined) {
    throw new Error('useSubsidiary must be used within a SubsidiaryProvider');
  }
  return context;
}