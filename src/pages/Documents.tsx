import { useState, useEffect } from 'react';
import { Plus, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubsidiary } from '@/contexts/SubsidiaryContext';
import { toast } from '@/hooks/use-toast';
import { DocumentsTable } from '@/components/documents/DocumentsTable';
import { DocumentDialog } from '@/components/documents/DocumentDialog';
import { useIsMobile } from '@/hooks/use-mobile';

export interface DocumentRecord {
  id: string;
  vehicle_id: string;
  document_type: string;
  document_name: string;
  document_number?: string;
  issue_date?: string;
  expiry_date?: string;
  issuing_authority?: string;
  document_url?: string;
  alert_days_before: number;
  remarks?: string;
  status: string;
  created_at: string;
  updated_at: string;
  vehicles?: {
    id: string;
    vehicle_number: string;
    make: string;
    model: string;
  };
}

export default function Documents() {
  const { profile } = useAuth();
  const { currentSubsidiary, allSubsidiariesView } = useSubsidiary();
  const isMobile = useIsMobile();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentRecord | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [currentSubsidiary, allSubsidiariesView]);

  const fetchDocuments = async () => {
    try {
      let query = supabase
        .from('vehicle_documents')
        .select(`
          *,
          vehicles:vehicle_id (
            id,
            vehicle_number,
            make,
            model
          )
        `);

      // Apply subsidiary filtering
      if (!allSubsidiariesView && currentSubsidiary) {
        query = query.eq('subsidiary_id', currentSubsidiary.id);
      }

      const { data, error } = await query.order('expiry_date', { ascending: true, nullsFirst: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = () => {
    setEditingDocument(null);
    setDialogOpen(true);
  };

  const handleEditDocument = (document: DocumentRecord) => {
    setEditingDocument(document);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    fetchDocuments();
    setDialogOpen(false);
    setEditingDocument(null);
  };

  // Calculate summary statistics
  const totalDocuments = documents.length;
  const expiredCount = documents.filter(d => d.status === 'expired').length;
  const expiringSoonCount = documents.filter(d => d.status === 'expiring_soon').length;
  const expiringCount = documents.filter(d => d.status === 'expiring').length;
  const validCount = documents.filter(d => d.status === 'valid').length;

  const compliancePercentage = totalDocuments > 0 
    ? Math.round(((validCount + expiringCount) / totalDocuments) * 100) 
    : 100;

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl p-8 mb-8">
        <div className="absolute inset-0 gradient-info opacity-90"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="relative z-10 flex items-center justify-between text-white">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-4xl font-bold">Document Management</h1>
              {allSubsidiariesView && (
                <Badge variant="secondary" className="text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  All Subsidiaries
                </Badge>
              )}
            </div>
            <p className="text-white/90 text-lg">
              {allSubsidiariesView 
                ? "Track vehicle compliance and manage document renewals across all subsidiaries"
                : currentSubsidiary 
                  ? `Document management for ${currentSubsidiary.subsidiary_name}`
                  : "Track vehicle compliance and manage document renewals"
              }
            </p>
          </div>
          <Button
            onClick={handleAddDocument}
            className="btn-gradient text-white border-white/30 hover:bg-white/20"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Document
          </Button>
        </div>
      </div>

      {/* Compliance Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <Card className="card-info hover-lift">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold gradient-text mb-2">{totalDocuments}</div>
            <div className="text-sm text-muted-foreground">Total Documents</div>
          </CardContent>
        </Card>

        <Card className="card-success hover-lift">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{validCount}</div>
            <div className="text-sm text-muted-foreground">Valid</div>
          </CardContent>
        </Card>

        <Card className="card-warning hover-lift">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">{expiringCount}</div>
            <div className="text-sm text-muted-foreground">Expiring Soon</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-orange-200/50 hover-lift">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">{expiringSoonCount}</div>
            <div className="text-sm text-muted-foreground">Critical</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-red-200/50 hover-lift">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">{expiredCount}</div>
            <div className="text-sm text-muted-foreground">Expired</div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Percentage */}
      <Card className="card-purple hover-lift">
        <CardHeader className="gradient-purple text-white rounded-t-lg">
          <CardTitle className="text-white">Fleet Compliance Status</CardTitle>
          <CardDescription className="text-white/90">
            Overall compliance based on valid and expiring documents
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">{compliancePercentage}%</div>
              <div className="text-muted-foreground">Compliance Rate</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-green-600">{validCount + expiringCount} Compliant</div>
              <div className="text-sm text-red-600">{expiredCount + expiringSoonCount} Non-compliant</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="gradient-success h-3 rounded-full transition-all duration-500" 
                style={{ width: `${compliancePercentage}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card className="glass-card hover-lift">
        <CardHeader>
          <CardTitle className="gradient-header-text">Vehicle Documents</CardTitle>
          <CardDescription>
            Manage and track all vehicle compliance documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentsTable
            documents={documents}
            loading={loading}
            onEdit={handleEditDocument}
            onRefresh={fetchDocuments}
          />
        </CardContent>
      </Card>

      {/* Document Dialog */}
      <DocumentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        document={editingDocument}
        onSuccess={handleSuccess}
      />

      {/* Mobile FAB */}
      {isMobile && (
        <Button
          onClick={handleAddDocument}
          className="fab btn-gradient"
          size="lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}