import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

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

interface SubsidiaryContextType {
  subsidiaries: Subsidiary[];
  currentSubsidiary: Subsidiary | null;
  setCurrentSubsidiary: (subsidiary: Subsidiary) => void;
  loading: boolean;
  refreshSubsidiaries: () => Promise<void>;
  canManageSubsidiaries: boolean;
}

const SubsidiaryContext = createContext<SubsidiaryContextType | undefined>(undefined);

export function SubsidiaryProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
  const [currentSubsidiary, setCurrentSubsidiaryState] = useState<Subsidiary | null>(null);
  const [loading, setLoading] = useState(true);

  const canManageSubsidiaries = profile?.is_super_admin || profile?.role === 'admin';

  useEffect(() => {
    if (profile) {
      fetchSubsidiaries();
    }
  }, [profile]);

  const fetchSubsidiaries = async () => {
    try {
      const { data, error } = await supabase
        .from('subsidiaries')
        .select('*')
        .eq('is_active', true)
        .order('subsidiary_name');

      if (error) throw error;

      setSubsidiaries(data || [] as any);

      // Set default subsidiary if not already set
      if (data && data.length > 0 && !currentSubsidiary) {
        const defaultSub = data.find(sub => sub.id === profile?.default_subsidiary_id) || data[0];
        setCurrentSubsidiaryState(defaultSub as any);
        
        // Store in localStorage for persistence
        localStorage.setItem('selectedSubsidiary', defaultSub.id);
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

  const setCurrentSubsidiary = (subsidiary: Subsidiary) => {
    setCurrentSubsidiaryState(subsidiary);
    localStorage.setItem('selectedSubsidiary', subsidiary.id);
    
    toast({
      title: 'Subsidiary Changed',
      description: `Switched to ${subsidiary.subsidiary_name}`,
    });
  };

  // Load selected subsidiary from localStorage on mount
  useEffect(() => {
    const savedSubsidiaryId = localStorage.getItem('selectedSubsidiary');
    if (savedSubsidiaryId && subsidiaries.length > 0) {
      const savedSubsidiary = subsidiaries.find(sub => sub.id === savedSubsidiaryId);
      if (savedSubsidiary) {
        setCurrentSubsidiaryState(savedSubsidiary);
      }
    }
  }, [subsidiaries]);

  const refreshSubsidiaries = async () => {
    await fetchSubsidiaries();
  };

  const value = {
    subsidiaries,
    currentSubsidiary,
    setCurrentSubsidiary,
    loading,
    refreshSubsidiaries,
    canManageSubsidiaries,
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