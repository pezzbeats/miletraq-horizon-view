import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubsidiaryDialog } from "@/components/settings/SubsidiaryDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Phone, Mail, Calendar } from "lucide-react";

export interface Subsidiary {
  id: string;
  subsidiary_name: string;
  subsidiary_code: string;
  business_type: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  registered_address?: string;
  gstin?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  created_by?: string;
}

const Subsidiaries = () => {
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubsidiary, setEditingSubsidiary] = useState<Subsidiary | null>(null);
  const { profile } = useAuth();

  const fetchSubsidiaries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subsidiaries')
        .select('*')
        .order('subsidiary_name');

      if (error) throw error;
      setSubsidiaries(data || []);
    } catch (error) {
      console.error('Error fetching subsidiaries:', error);
      toast({
        title: "Error",
        description: "Failed to load subsidiaries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubsidiaries();
  }, []);

  const handleAddSubsidiary = () => {
    setEditingSubsidiary(null);
    setDialogOpen(true);
  };

  const handleEditSubsidiary = (subsidiary: Subsidiary) => {
    setEditingSubsidiary(subsidiary);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    fetchSubsidiaries();
    setDialogOpen(false);
    setEditingSubsidiary(null);
  };

  const handleToggleStatus = async (subsidiary: Subsidiary) => {
    try {
      const { error } = await supabase
        .from('subsidiaries')
        .update({ is_active: !subsidiary.is_active })
        .eq('id', subsidiary.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Subsidiary ${subsidiary.is_active ? 'deactivated' : 'activated'} successfully`,
      });

      fetchSubsidiaries();
    } catch (error) {
      console.error('Error updating subsidiary status:', error);
      toast({
        title: "Error",
        description: "Failed to update subsidiary status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Check if user has permission to manage subsidiaries
  const canManageSubsidiaries = profile?.is_super_admin || profile?.role === 'admin';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Subsidiaries</h1>
          <p className="text-muted-foreground">Manage subsidiary companies and business units</p>
        </div>
        {canManageSubsidiaries && (
          <Button onClick={handleAddSubsidiary} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Subsidiary
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Subsidiaries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subsidiaries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Subsidiaries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {subsidiaries.filter(s => s.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Business Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(subsidiaries.map(s => s.business_type)).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              With GST Registration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subsidiaries.filter(s => s.gstin).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subsidiaries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subsidiaries.map((subsidiary) => (
          <Card 
            key={subsidiary.id} 
            className={`hover:shadow-lg transition-shadow cursor-pointer ${
              !subsidiary.is_active ? 'opacity-60' : ''
            }`}
            onClick={() => canManageSubsidiaries && handleEditSubsidiary(subsidiary)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{subsidiary.subsidiary_name}</CardTitle>
                    <p className="text-sm text-muted-foreground font-mono">
                      {subsidiary.subsidiary_code}
                    </p>
                  </div>
                </div>
                <Badge variant={subsidiary.is_active ? "default" : "secondary"}>
                  {subsidiary.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{subsidiary.business_type}</span>
                </div>
                
                {subsidiary.contact_person && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">Contact:</span>
                    <span>{subsidiary.contact_person}</span>
                  </div>
                )}
                
                {subsidiary.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{subsidiary.phone}</span>
                  </div>
                )}
                
                {subsidiary.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{subsidiary.email}</span>
                  </div>
                )}
                
                {subsidiary.registered_address && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{subsidiary.registered_address}</span>
                  </div>
                )}
                
                {subsidiary.gstin && (
                  <div className="text-sm">
                    <span className="font-medium text-muted-foreground">GSTIN:</span>
                    <span className="ml-1 font-mono">{subsidiary.gstin}</span>
                  </div>
                )}
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Created {new Date(subsidiary.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {subsidiaries.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Subsidiaries Found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first subsidiary company
            </p>
            {canManageSubsidiaries && (
              <Button onClick={handleAddSubsidiary}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Subsidiary
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <SubsidiaryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        subsidiary={editingSubsidiary}
        onSuccess={handleSuccess}
      />

      {/* Mobile FAB */}
      {canManageSubsidiaries && (
        <Button
          className="fixed bottom-32 right-4 h-14 w-14 rounded-full shadow-lg md:hidden z-50 bg-primary hover:bg-primary/90"
          onClick={handleAddSubsidiary}
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default Subsidiaries;