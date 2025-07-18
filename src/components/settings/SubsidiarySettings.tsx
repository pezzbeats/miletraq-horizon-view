import { useState, useEffect } from 'react';
import { Building2, Plus, Edit, Trash2, MoreHorizontal, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSubsidiary } from '@/contexts/SubsidiaryContext';
import { SubsidiaryDialog } from './SubsidiaryDialog';

interface Subsidiary {
  id: string;
  subsidiary_name: string;
  subsidiary_code: string;
  business_type: string;
  gstin?: string;
  registered_address?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  user_count?: number;
}

export const SubsidiarySettings = () => {
  const { profile } = useAuth();
  const { refreshSubsidiaries } = useSubsidiary();
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubsidiary, setEditingSubsidiary] = useState<Subsidiary | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchSubsidiaries();
  }, []);

  const fetchSubsidiaries = async () => {
    try {
      setLoading(true);
      
      // Fetch subsidiaries with user count
      const { data: subsidiariesData, error: subsidiariesError } = await supabase
        .from('subsidiaries')
        .select(`
          id,
          subsidiary_name,
          subsidiary_code,
          business_type,
          gstin,
          registered_address,
          contact_person,
          phone,
          email,
          is_active
        `)
        .order('subsidiary_name');

      if (subsidiariesError) throw subsidiariesError;

      // Get user counts for each subsidiary
      const subsidiariesWithCounts = await Promise.all(
        (subsidiariesData || []).map(async (subsidiary) => {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .contains('subsidiary_access', [subsidiary.id]);
          
          return {
            ...subsidiary,
            user_count: count || 0,
          };
        })
      );

      setSubsidiaries(subsidiariesWithCounts);
    } catch (error) {
      console.error('Error fetching subsidiaries:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch subsidiaries',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subsidiary: Subsidiary) => {
    setEditingSubsidiary(subsidiary);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingSubsidiary(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingSubsidiary(null);
  };

  const handleSuccess = () => {
    handleDialogClose();
    fetchSubsidiaries();
    refreshSubsidiaries();
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);

      const { error } = await supabase
        .from('subsidiaries')
        .update({ is_active: false })
        .eq('id', deleteId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Subsidiary deactivated successfully',
      });

      fetchSubsidiaries();
      refreshSubsidiaries();
    } catch (error) {
      console.error('Error deleting subsidiary:', error);
      toast({
        title: 'Error',
        description: 'Failed to deactivate subsidiary',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const filteredSubsidiaries = subsidiaries.filter((subsidiary) =>
    subsidiary.subsidiary_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subsidiary.subsidiary_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subsidiary.business_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!profile?.is_super_admin) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">
              Only super administrators can manage subsidiaries.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Subsidiary Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage subsidiaries and business units
              </p>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Subsidiary
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search subsidiaries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {loading ? (
            <div className="border rounded-lg">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 border-b animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subsidiary Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Business Type</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubsidiaries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="text-muted-foreground">
                          {subsidiaries.length === 0 ? (
                            <>
                              <Building2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                              <div className="text-lg font-medium mb-2">No subsidiaries found</div>
                              <div>Add your first subsidiary to get started</div>
                            </>
                          ) : (
                            "No subsidiaries match your search criteria"
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubsidiaries.map((subsidiary) => (
                      <TableRow key={subsidiary.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{subsidiary.subsidiary_name}</div>
                            {subsidiary.contact_person && (
                              <div className="text-sm text-muted-foreground">
                                Contact: {subsidiary.contact_person}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{subsidiary.subsidiary_code}</Badge>
                        </TableCell>
                        <TableCell className="capitalize">
                          {subsidiary.business_type.replace('_', ' ')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{subsidiary.user_count || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={subsidiary.is_active ? "default" : "secondary"}>
                            {subsidiary.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(subsidiary)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              {subsidiary.is_active && (
                                <DropdownMenuItem 
                                  onClick={() => setDeleteId(subsidiary.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Deactivate
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <SubsidiaryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        subsidiary={editingSubsidiary}
        onSuccess={handleSuccess}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Subsidiary</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate this subsidiary? This will hide it from the system
              but preserve all data for audit purposes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deactivating..." : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};