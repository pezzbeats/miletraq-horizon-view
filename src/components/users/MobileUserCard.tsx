import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash2, User, Phone, Shield, Mail, Calendar } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type UserProfile = Tables<'profiles'>;

interface MobileUserCardProps {
  user: UserProfile;
  onEdit: (user: UserProfile) => void;
  onDelete: (user: UserProfile) => void;
  onChangePassword: (user: UserProfile) => void;
  onManagePermissions?: (user: UserProfile) => void;
  canEdit?: boolean;
  showSubsidiary?: boolean;
  currentUser?: any;
}

const roleColors = {
  admin: 'bg-red-500 text-white',
  manager: 'bg-blue-500 text-white',
  fuel_manager: 'bg-green-500 text-white',
  viewer: 'bg-gray-500 text-white',
};

const roleLabels = {
  admin: 'Admin',
  manager: 'Manager',
  fuel_manager: 'Fuel Manager',
  viewer: 'Viewer',
};

export function MobileUserCard({ 
  user, 
  onEdit, 
  onDelete, 
  onChangePassword,
  onManagePermissions,
  canEdit = true,
  showSubsidiary = false,
  currentUser
}: MobileUserCardProps) {
  const isCurrentUser = user.id === currentUser?.id;
  
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'manager': return <User className="h-4 w-4" />;
      case 'fuel_manager': return <User className="h-4 w-4" />;
      case 'viewer': return <User className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="mobile-user-card hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-bold truncate">
                  {user.full_name}
                  {isCurrentUser && (
                    <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                  )}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={`text-xs ${roleColors[user.role as keyof typeof roleColors]}`}>
                    <div className="flex items-center space-x-1">
                      {getRoleIcon(user.role)}
                      <span>{roleLabels[user.role as keyof typeof roleLabels]}</span>
                    </div>
                  </Badge>
                  <Badge variant={user.is_active ? 'default' : 'secondary'} className="text-xs">
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 touch-target"
            onClick={(e) => {
              e.stopPropagation();
              // Handle options menu
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Contact Information */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium truncate">{user.email}</span>
          </div>
          
          {user.phone && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{user.phone}</span>
            </div>
          )}
        </div>

        {/* User Details */}
        <div className="border-t pt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              Joined:
            </span>
            <span className="font-medium">{formatDate(user.created_at)}</span>
          </div>
          
          {user.is_super_admin && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Super Admin:</span>
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Yes
              </Badge>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t pt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="touch-target"
              onClick={() => onEdit(user)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="touch-target"
              onClick={() => onChangePassword(user)}
            >
              <Shield className="h-4 w-4 mr-1" />
              Password
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {onManagePermissions && (
              <Button
                variant="outline"
                size="sm"
                className="touch-target"
                onClick={() => onManagePermissions(user)}
              >
                <Shield className="h-4 w-4 mr-1" />
                Permissions
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="touch-target text-destructive"
              onClick={() => onDelete(user)}
              disabled={isCurrentUser}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
          
          {isCurrentUser && (
            <p className="text-xs text-muted-foreground text-center">
              You cannot modify your own account status
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}