import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Building, Plus, Trash2, Shield, Eye, Wrench, Fuel, Users } from 'lucide-react';

type PermissionLevel = 'full_access' | 'operational_access' | 'read_only_access' | 'fuel_only_access' | 'maintenance_only_access';

interface Subsidiary {
  id: string;
  subsidiary_name: string;
  subsidiary_code: string;
  business_type: string;
}

interface UserPermission {
  id?: string;
  subsidiary_id: string;
  permission_level: PermissionLevel;
  subsidiary?: Subsidiary;
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  default_subsidiary_id?: string;
}

interface UserSubsidiaryPermissionsDialogProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const permissionLabels = {
  full_access: 'Full Access',
  operational_access: 'Operational Access',
  read_only_access: 'Read Only Access',
  fuel_only_access: 'Fuel Only Access',
  maintenance_only_access: 'Maintenance Only Access',
};

const permissionIcons = {
  full_access: Shield,
  operational_access: Users,
  read_only_access: Eye,
  fuel_only_access: Fuel,
  maintenance_only_access: Wrench,
};

const permissionDescriptions = {
  full_access: 'Complete access to all features and data',
  operational_access: 'Access to operational features excluding user management',
  read_only_access: 'View-only access to all data',
  fuel_only_access: 'Access limited to fuel management features',
  maintenance_only_access: 'Access limited to maintenance features',
};

export function UserSubsidiaryPermissionsDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: UserSubsidiaryPermissionsDialogProps) {
  const { profile } = useAuth();
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [defaultSubsidiaryId, setDefaultSubsidiaryId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchData();
    }
  }, [open, user]);

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch all subsidiaries
      const { data: subsidiariesData, error: subsidiariesError } = await supabase
        .from('subsidiaries')
        .select('*')
        .eq('is_active', true)
        .order('subsidiary_name');

      if (subsidiariesError) throw subsidiariesError;

      // Fetch user's current permissions
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('user_subsidiary_permissions')
        .select(`
          *,
          subsidiaries (*)
        `)
        .eq('user_id', user.id);

      if (permissionsError) throw permissionsError;

      setSubsidiaries(subsidiariesData || []);
      setUserPermissions(permissionsData || []);
      setDefaultSubsidiaryId(user.default_subsidiary_id || '');
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user permissions data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPermission = () => {
    const availableSubsidiaries = subsidiaries.filter(
      sub => !userPermissions.some(perm => perm.subsidiary_id === sub.id)
    );
    
    if (availableSubsidiaries.length === 0) {
      toast({
        title: 'No subsidiaries available',
        description: 'User already has permissions for all subsidiaries',
        variant: 'destructive',
      });
      return;
    }

    const newPermission: UserPermission = {
      subsidiary_id: availableSubsidiaries[0].id,
      permission_level: 'read_only_access',
    };

    setUserPermissions([...userPermissions, newPermission]);
  };

  const handleRemovePermission = (index: number) => {
    const newPermissions = userPermissions.filter((_, i) => i !== index);
    setUserPermissions(newPermissions);
    
    // If removing the default subsidiary, clear the default
    const removedPermission = userPermissions[index];
    if (removedPermission.subsidiary_id === defaultSubsidiaryId) {
      setDefaultSubsidiaryId('');
    }
  };

  const handlePermissionChange = (index: number, field: keyof UserPermission, value: any) => {
    const newPermissions = [...userPermissions];
    newPermissions[index] = { ...newPermissions[index], [field]: value };
    setUserPermissions(newPermissions);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Delete existing permissions
      const { error: deleteError } = await supabase
        .from('user_subsidiary_permissions')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Insert new permissions
      if (userPermissions.length > 0) {
        const permissionsToInsert = userPermissions.map(perm => ({
          user_id: user.id,
          subsidiary_id: perm.subsidiary_id,
          permission_level: perm.permission_level,
          assigned_by: profile?.id,
        }));

        const { error: insertError } = await supabase
          .from('user_subsidiary_permissions')
          .insert(permissionsToInsert);

        if (insertError) throw insertError;
      }

      // Update default subsidiary
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ default_subsidiary_id: defaultSubsidiaryId || null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: 'User permissions updated successfully',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to save user permissions',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getSubsidiaryName = (subsidiaryId: string) => {
    const subsidiary = subsidiaries.find(sub => sub.id === subsidiaryId);
    return subsidiary ? subsidiary.subsidiary_name : 'Unknown Subsidiary';
  };

  const availableSubsidiaries = subsidiaries.filter(
    sub => !userPermissions.some(perm => perm.subsidiary_id === sub.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Manage Subsidiary Permissions - {user?.full_name}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Default Subsidiary Selection */}
            <div className="space-y-2">
              <Label htmlFor="default-subsidiary">Default Subsidiary</Label>
              <Select value={defaultSubsidiaryId} onValueChange={setDefaultSubsidiaryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select default subsidiary" />
                </SelectTrigger>
                <SelectContent>
                  {userPermissions.map((perm) => {
                    const subsidiary = subsidiaries.find(sub => sub.id === perm.subsidiary_id);
                    return subsidiary ? (
                      <SelectItem key={subsidiary.id} value={subsidiary.id}>
                        {subsidiary.subsidiary_name} ({subsidiary.subsidiary_code})
                      </SelectItem>
                    ) : null;
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The subsidiary the user will see by default when logging in
              </p>
            </div>

            {/* Permissions List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Subsidiary Permissions</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddPermission}
                  disabled={availableSubsidiaries.length === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Permission
                </Button>
              </div>

              {userPermissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No subsidiary permissions assigned. Click "Add Permission" to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {userPermissions.map((permission, index) => {
                    const PermissionIcon = permissionIcons[permission.permission_level];
                    return (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div>
                              <Label htmlFor={`subsidiary-${index}`}>Subsidiary</Label>
                              <Select
                                value={permission.subsidiary_id}
                                onValueChange={(value) => handlePermissionChange(index, 'subsidiary_id', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {subsidiaries
                                    .filter(sub => 
                                      sub.id === permission.subsidiary_id || 
                                      !userPermissions.some(perm => perm.subsidiary_id === sub.id)
                                    )
                                    .map((subsidiary) => (
                                      <SelectItem key={subsidiary.id} value={subsidiary.id}>
                                        {subsidiary.subsidiary_name} ({subsidiary.subsidiary_code})
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor={`permission-${index}`}>Permission Level</Label>
                              <Select
                                value={permission.permission_level}
                                onValueChange={(value) => handlePermissionChange(index, 'permission_level', value as PermissionLevel)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(permissionLabels).map(([value, label]) => {
                                    const Icon = permissionIcons[value as PermissionLevel];
                                    return (
                                      <SelectItem key={value} value={value}>
                                        <div className="flex items-center gap-2">
                                          <Icon className="h-4 w-4" />
                                          <div className="flex flex-col">
                                            <span>{label}</span>
                                            <span className="text-xs text-muted-foreground">
                                              {permissionDescriptions[value as PermissionLevel]}
                                            </span>
                                          </div>
                                        </div>
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePermission(index)}
                            className="ml-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          <PermissionIcon className="h-4 w-4" />
                          <Badge variant="outline">
                            {permissionLabels[permission.permission_level]}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {permissionDescriptions[permission.permission_level]}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Permissions'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}