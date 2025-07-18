import { useState } from 'react';
import { format } from 'date-fns';
import { 
  Edit2, 
  Trash2, 
  Download, 
  Search, 
  Filter, 
  RotateCcw,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { DocumentRecord } from '@/pages/Documents';

interface DocumentsTableProps {
  documents: DocumentRecord[];
  loading: boolean;
  onEdit: (document: DocumentRecord) => void;
  onRefresh: () => void;
}

export const DocumentsTable = ({
  documents,
  loading,
  onEdit,
  onRefresh,
}: DocumentsTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = 
      (doc.vehicles?.vehicle_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (doc.document_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (doc.issuing_authority?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || doc.document_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      const { error } = await supabase
        .from('vehicle_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });

      onRefresh();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status: string, expiryDate?: string) => {
    const today = new Date();
    const expiry = expiryDate ? new Date(expiryDate) : null;
    const daysToExpiry = expiry ? Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

    switch (status) {
      case 'expired':
        return (
          <Badge className="status-inactive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      case 'expiring_soon':
        return (
          <Badge className="gradient-error text-white">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Critical ({daysToExpiry}d)
          </Badge>
        );
      case 'expiring':
        return (
          <Badge className="status-warning">
            <Calendar className="h-3 w-3 mr-1" />
            Expiring ({daysToExpiry}d)
          </Badge>
        );
      case 'valid':
        return (
          <Badge className="status-active">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Valid ({daysToExpiry}d)
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getDocumentTypeDisplay = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'registration': 'RC',
      'insurance': 'Insurance',
      'fitness': 'Fitness',
      'permit': 'Permit',
      'pollution': 'PUC',
      'puc': 'PUC'
    };
    return typeMap[type] || type.toUpperCase();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Documents Found</h3>
        <p className="text-muted-foreground mb-4">
          Add your first vehicle document to start compliance tracking
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Enhanced Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 glass-card rounded-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicles, documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Document Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="registration">RC</SelectItem>
            <SelectItem value="insurance">Insurance</SelectItem>
            <SelectItem value="fitness">Fitness</SelectItem>
            <SelectItem value="permit">Permit</SelectItem>
            <SelectItem value="pollution">PUC</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="valid">Valid</SelectItem>
            <SelectItem value="expiring">Expiring</SelectItem>
            <SelectItem value="expiring_soon">Critical</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => {
            setSearchTerm('');
            setTypeFilter('all');
            setStatusFilter('all');
          }}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      {/* Documents Table */}
      <div className="rounded-lg border glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Vehicle</TableHead>
              <TableHead>Document Type</TableHead>
              <TableHead>Document Number</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issuing Authority</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.map((document) => (
              <TableRow key={document.id} className="hover:bg-muted/30">
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{document.vehicles?.vehicle_number}</div>
                    <div className="text-sm text-muted-foreground">
                      {document.vehicles?.make} {document.vehicles?.model}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-medium">
                    {getDocumentTypeDisplay(document.document_type)}
                  </Badge>
                </TableCell>
                <TableCell>{document.document_number || '-'}</TableCell>
                <TableCell>
                  {document.issue_date ? format(new Date(document.issue_date), 'MMM dd, yyyy') : '-'}
                </TableCell>
                <TableCell>
                  {document.expiry_date ? format(new Date(document.expiry_date), 'MMM dd, yyyy') : '-'}
                </TableCell>
                <TableCell>
                  {getStatusBadge(document.status, document.expiry_date)}
                </TableCell>
                <TableCell>{document.issuing_authority || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {document.document_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(document.document_url, '_blank')}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(document)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="modal-content">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Document</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this document? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(document.id)}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {deleting ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredDocuments.length === 0 && documents.length > 0 && (
        <div className="text-center py-8">
          <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No documents match your filters</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};