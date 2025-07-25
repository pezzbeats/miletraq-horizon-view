
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubsidiary } from '@/contexts/SubsidiaryContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { UserDialog } from '@/components/users/UserDialog';
import { DeleteUserDialog } from '@/components/users/DeleteUserDialog';
import { ChangePasswordDialog } from '@/components/users/ChangePasswordDialog';
import { UserSubsidiaryPermissionsDialog } from '@/components/users/UserSubsidiaryPermissionsDialog';
import { MobileUserCard } from '@/components/users/MobileUserCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Users as UsersIcon, Shield, Building2, Globe, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Users() {
  const { profile } = useAuth();
  const { currentSubsidiary, allSubsidiariesView, subsidiaries, canManageSubsidiaries } = useSubsidiary();
  const isMobile = useIsMobile();
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordUser, setPasswordUser] = useState<any>(null);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [permissionsUser, setPermissionsUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['users', currentSubsidiary?.id, allSubsidiariesView, profile?.id],
    queryFn: async () => {
      if (!profile) return [];

      // Regular users (non-managers) can only see their own profile
      if (!canManageSubsidiaries && !profile?.is_super_admin) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', profile?.user_id);
        
        if (error) throw error;
        return data || [];
      }

      if (profile?.is_super_admin) {
        // Super admins can see all users - simplified query
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_active', true)
          .order('full_name');
        
        if (error) throw error;
        
        // For each user, get their subsidiary permissions separately
        const usersWithPermissions = await Promise.all(
          (data || []).map(async (user) => {
            const { data: permissions } = await supabase
              .from('user_subsidiary_permissions')
              .select(`
                subsidiary_id,
                permission_level,
                subsidiaries (
                  subsidiary_name,
                  subsidiary_code
                )
              `)
              .eq('user_id', user.id);
            
            return {
              ...user,
              user_subsidiary_permissions: permissions || []
            };
          })
        );
        
        return usersWithPermissions;
      }

      if (allSubsidiariesView) {
        // Get users from all accessible subsidiaries
        const subsidiaryIds = subsidiaries.map(sub => sub.id);
        if (subsidiaryIds.length === 0) return [];

        const { data, error } = await supabase
          .from('user_subsidiary_permissions')
          .select(`
            user_id,
            permission_level,
            subsidiary_id,
            profiles!inner(*),
            subsidiaries (
              subsidiary_name,
              subsidiary_code
            )
          `)
          .in('subsidiary_id', subsidiaryIds)
          .eq('profiles.is_active', true);

        if (error) throw error;

        // Transform data to get unique users
        const userMap = new Map();
        data?.forEach((perm: any) => {
          const userId = perm.profiles.id;
          if (!userMap.has(userId)) {
            userMap.set(userId, {
              ...perm.profiles,
              user_subsidiary_permissions: []
            });
          }
          userMap.get(userId).user_subsidiary_permissions.push({
            subsidiary_id: perm.subsidiary_id,
            permission_level: perm.permission_level,
            subsidiaries: perm.subsidiaries
          });
        });

        return Array.from(userMap.values());
      } else if (currentSubsidiary) {
        // Get users from current subsidiary
        const { data, error } = await supabase
          .from('user_subsidiary_permissions')
          .select(`
            user_id,
            permission_level,
            profiles!inner(*),
            subsidiaries (
              subsidiary_name,
              subsidiary_code
            )
          `)
          .eq('subsidiary_id', currentSubsidiary.id)
          .eq('profiles.is_active', true);

        if (error) throw error;

        return data?.map((perm: any) => ({
          ...perm.profiles,
          current_permission_level: perm.permission_level,
          current_subsidiary: perm.subsidiaries
        })) || [];
      }

      return [];
    },
    enabled: !!profile
  });

  const filteredUsers = users?.filter(user => {
    const searchText = searchTerm.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(searchText) ||
      user.email?.toLowerCase().includes(searchText) ||
      user.role?.toLowerCase().includes(searchText)
    );
  }) || [];

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setUserDialogOpen(true);
  };

  const handleDelete = (user: any) => {
    setDeletingUser(user);
    setDeleteDialogOpen(true);
  };

  const handleChangePassword = (user: any) => {
    setPasswordUser(user);
    setPasswordDialogOpen(true);
  };

  const handleManagePermissions = (user: any) => {
    setPermissionsUser(user);
    setPermissionsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setUserDialogOpen(false);
    setEditingUser(null);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setDeletingUser(null);
  };

  const handlePasswordDialogClose = () => {
    setPasswordDialogOpen(false);
    setPasswordUser(null);
  };

  const handlePermissionsDialogClose = () => {
    setPermissionsDialogOpen(false);
    setPermissionsUser(null);
  };

  const handleSuccess = () => {
    refetch();
    toast({
      title: 'Success',
      description: editingUser ? 'User updated successfully' : 'User created successfully',
    });
  };

  const handleDeleteSuccess = () => {
    refetch();
    toast({
      title: 'Success',
      description: 'User deleted successfully',
    });
  };


  if (!allSubsidiariesView && !currentSubsidiary && !profile?.is_super_admin) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Subsidiary Selected</h3>
            <p className="text-muted-foreground">
              Please select a subsidiary to manage users
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-4 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Users</h1>
            {allSubsidiariesView && (
              <Badge variant="secondary" className="text-xs">
                <Globe className="h-3 w-3 mr-1" />
                All Subsidiaries
              </Badge>
            )}
          </div>
          {canManageSubsidiaries && (
            <Button size="sm" onClick={() => setUserDialogOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* User Cards */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))
          ) : filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <UsersIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No users found</p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((user) => (
              <MobileUserCard
                key={user.id}
                user={user}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onChangePassword={handleChangePassword}
                onManagePermissions={handleManagePermissions}
                canEdit={canManageSubsidiaries}
                showSubsidiary={allSubsidiariesView}
                currentUser={profile}
              />
            ))
          )}
        </div>

        {/* Dialogs */}
        {canManageSubsidiaries && (
          <>
            <UserDialog
              open={userDialogOpen}
              onOpenChange={handleDialogClose}
              user={editingUser}
              onSuccess={handleSuccess}
            />

            <DeleteUserDialog
              open={deleteDialogOpen}
              onOpenChange={handleDeleteDialogClose}
              user={deletingUser}
              onSuccess={handleDeleteSuccess}
            />

            <ChangePasswordDialog
              open={passwordDialogOpen}
              onOpenChange={handlePasswordDialogClose}
              user={passwordUser}
              onSuccess={refetch}
            />

            <UserSubsidiaryPermissionsDialog
              open={permissionsDialogOpen}
              onOpenChange={handlePermissionsDialogClose}
              user={permissionsUser}
              onSuccess={refetch}
            />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UsersIcon className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            {allSubsidiariesView ? (
              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                <Globe className="h-4 w-4" />
                Showing users from all accessible subsidiaries
              </p>
            ) : currentSubsidiary ? (
              <p className="text-muted-foreground">
                {currentSubsidiary.subsidiary_name} ({currentSubsidiary.subsidiary_code})
              </p>
            ) : profile?.is_super_admin && (
              <p className="text-muted-foreground">
                All users (Super Admin view)
              </p>
            )}
          </div>
        </div>
        {canManageSubsidiaries && (
          <Button onClick={() => setUserDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {filteredUsers.length} User{filteredUsers.length !== 1 ? 's' : ''}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground mb-4">
                {users?.length === 0 
                  ? "Get started by adding your first user"
                  : "Try adjusting your search"
                }
              </p>
              {users?.length === 0 && canManageSubsidiaries && (
                <Button onClick={() => setUserDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  {(allSubsidiariesView || profile?.is_super_admin) && <TableHead>Subsidiaries</TableHead>}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.full_name}</span>
                          {user.is_super_admin && (
                            <Badge variant="default" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              SUPER ADMIN
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.role?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? 'default' : 'secondary'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    {(allSubsidiariesView || profile?.is_super_admin) && (
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.user_subsidiary_permissions?.length > 0 ? (
                            user.user_subsidiary_permissions.slice(0, 2).map((perm: any, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {perm.subsidiaries?.subsidiary_code || 'Unknown'}
                              </Badge>
                            ))
                          ) : user.current_subsidiary ? (
                            <Badge variant="outline" className="text-xs">
                              {user.current_subsidiary.subsidiary_code}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">No access</span>
                          )}
                          {user.user_subsidiary_permissions?.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{user.user_subsidiary_permissions.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {canManageSubsidiaries && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleManagePermissions(user)}
                            >
                              <Settings className="h-3 w-3 mr-1" />
                              Permissions
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(user)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleChangePassword(user)}
                            >
                              Password
                            </Button>
                            {user.id !== profile?.id && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(user)}
                              >
                                Delete
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {canManageSubsidiaries && (
        <>
          <UserDialog
            open={userDialogOpen}
            onOpenChange={handleDialogClose}
            user={editingUser}
            onSuccess={handleSuccess}
          />

          <DeleteUserDialog
            open={deleteDialogOpen}
            onOpenChange={handleDeleteDialogClose}
            user={deletingUser}
            onSuccess={handleDeleteSuccess}
          />

          <ChangePasswordDialog
            open={passwordDialogOpen}
            onOpenChange={handlePasswordDialogClose}
            user={passwordUser}
            onSuccess={refetch}
          />

          <UserSubsidiaryPermissionsDialog
            open={permissionsDialogOpen}
            onOpenChange={handlePermissionsDialogClose}
            user={permissionsUser}
            onSuccess={refetch}
          />
        </>
      )}

      {/* Mobile FAB */}
      {isMobile && canManageSubsidiaries && (
        <Button
          onClick={() => setUserDialogOpen(true)}
          className="fixed bottom-32 right-4 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
