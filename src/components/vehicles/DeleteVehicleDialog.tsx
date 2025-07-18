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

type Vehicle = Tables<'vehicles'>;

interface DeleteVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle | null;
  onSuccess: () => void;
}

export const DeleteVehicleDialog: React.FC<DeleteVehicleDialogProps> = ({
  open,
  onOpenChange,
  vehicle,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!vehicle) return;

    try {
      setLoading(true);

      // Check if vehicle is used in fuel logs or maintenance records
      const { data: fuelLogs, error: fuelError } = await supabase
        .from('fuel_log')
        .select('id')
        .eq('vehicle_id', vehicle.id)
        .limit(1);

      if (fuelError) throw fuelError;

      const { data: maintenanceLogs, error: maintenanceError } = await supabase
        .from('maintenance_log')
        .select('id')
        .eq('vehicle_id', vehicle.id)
        .limit(1);

      if (maintenanceError) throw maintenanceError;

      if (fuelLogs && fuelLogs.length > 0) {
        toast({
          title: 'Cannot Delete Vehicle',
          description: 'This vehicle has fuel log entries. Please remove them first.',
          variant: 'destructive',
        });
        return;
      }

      if (maintenanceLogs && maintenanceLogs.length > 0) {
        toast({
          title: 'Cannot Delete Vehicle',
          description: 'This vehicle has maintenance records. Please remove them first.',
          variant: 'destructive',
        });
        return;
      }

      // Delete related records first
      await supabase
        .from('vehicle_documents')
        .delete()
        .eq('vehicle_id', vehicle.id);

      await supabase
        .from('odometer_readings')
        .delete()
        .eq('vehicle_id', vehicle.id);

      // Delete the vehicle
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicle.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Vehicle deleted successfully.',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete vehicle.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Are you sure you want to delete vehicle{' '}
            <span className="font-medium">{vehicle?.vehicle_number}</span>?
            <br />
            <br />
            This action cannot be undone. All related documents and odometer readings will also be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Deleting...' : 'Delete Vehicle'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};