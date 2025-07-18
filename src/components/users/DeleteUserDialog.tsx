import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { Trash2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const deleteSchema = z.object({
  adminPassword: z.string().min(1, 'Admin password is required'),
  confirmText: z.string().min(1, 'Confirmation text is required'),
});

type DeleteFormData = z.infer<typeof deleteSchema>;
type UserProfile = Tables<'profiles'>;

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
  onSuccess: () => void;
}

export function DeleteUserDialog({ open, onOpenChange, user, onSuccess }: DeleteUserDialogProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const confirmationText = `DELETE ${user?.full_name}`;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<DeleteFormData>({
    resolver: zodResolver(deleteSchema),
  });

  const watchedConfirmText = watch('confirmText');
  const isConfirmationValid = watchedConfirmText === confirmationText;

  const onSubmit = async (data: DeleteFormData) => {
    if (!user) return;

    if (!isConfirmationValid) {
      toast({
        title: 'Error',
        description: 'Confirmation text does not match',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // First verify admin password
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: profile?.email || '',
        password: data.adminPassword,
      });

      if (verifyError) {
        toast({
          title: 'Error',
          description: 'Invalid admin password',
          variant: 'destructive',
        });
        return;
      }

      // Delete the user from auth (this will cascade to profiles via trigger)
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.user_id);

      if (deleteError) throw deleteError;

      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });

      onSuccess();
      reset();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete User - {user?.full_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This action cannot be undone. This will permanently delete the user account 
              and all associated data. The user will be immediately logged out and will no longer be able to access the system.
            </AlertDescription>
          </Alert>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold">User Details:</h4>
            <div className="text-sm space-y-1">
              <p><strong>Name:</strong> {user?.full_name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> {user?.role}</p>
              <p><strong>Status:</strong> {user?.is_active ? 'Active' : 'Inactive'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminPassword">Your Admin Password *</Label>
              <div className="relative">
                <Input
                  id="adminPassword"
                  type={showPassword ? 'text' : 'password'}
                  {...register('adminPassword')}
                  placeholder="Enter your admin password to confirm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.adminPassword && (
                <p className="text-sm text-destructive">{errors.adminPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmText">
                Confirmation Text *
              </Label>
              <p className="text-sm text-muted-foreground">
                Type <code className="bg-muted px-1 py-0.5 rounded">{confirmationText}</code> to confirm deletion:
              </p>
              <Input
                id="confirmText"
                {...register('confirmText')}
                placeholder={confirmationText}
                className={isConfirmationValid ? 'border-green-500' : ''}
              />
              {errors.confirmText && (
                <p className="text-sm text-destructive">{errors.confirmText.message}</p>
              )}
              {watchedConfirmText && !isConfirmationValid && (
                <p className="text-sm text-destructive">Confirmation text does not match</p>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="destructive"
                disabled={loading || !isConfirmationValid}
              >
                {loading ? 'Deleting...' : 'Delete User'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}