import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Driver = Tables<'drivers'>;

interface DeleteDriverDialogProps {
  driver: Driver | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

export const DeleteDriverDialog: React.FC<DeleteDriverDialogProps> = ({
  driver,
  open,
  onOpenChange,
  onDelete,
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!driver) return;

    setLoading(true);

    try {
      // Check if driver is assigned to any vehicles
      const { data: vehicles, error: vehicleError } = await supabase
        .from('vehicles')
        .select('id, vehicle_number')
        .eq('default_driver_id', driver.id);

      if (vehicleError) throw vehicleError;

      if (vehicles && vehicles.length > 0) {
        toast({
          title: "Cannot Delete Driver",
          description: `This driver is assigned to ${vehicles.length} vehicle(s). Please reassign or remove the driver from vehicles before deleting.`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Delete the driver
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', driver.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Driver deleted successfully.",
      });

      onDelete();
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast({
        title: "Error",
        description: "Failed to delete driver. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!driver) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Driver
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{driver.name}</strong>?
            This action cannot be undone.
            
            {driver.license_number && (
              <div className="mt-2 text-sm">
                License: {driver.license_number}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Deleting...' : 'Delete Driver'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};