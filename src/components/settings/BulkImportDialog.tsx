import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, CheckCircle, AlertCircle, Users, Car } from 'lucide-react';

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ImportResult {
  vehicles: { success: number; errors: string[] };
  drivers: { success: number; errors: string[] };
}

const SPS_DATA = {
  subsidiaries: {
    'Shri Sai Public School, Kashipur': '71b61011-6024-463a-a821-b9bece1e7b34',
    'Sai Public School, Kashipur': 'ca6c447c-6646-49fb-b9ca-73de334a634d'
  },
  vehicles: [
    // Shri Sai Public School vehicles
    { vehicle_number: 'UK06PA0284', make: 'Bus', model: 'School Bus', year: 2006, fuel_type: 'diesel', subsidiary: 'Shri Sai Public School, Kashipur', tank_capacity: 100 },
    { vehicle_number: 'UK06PA0305', make: 'Bus', model: 'School Bus', year: 2006, fuel_type: 'diesel', subsidiary: 'Shri Sai Public School, Kashipur', tank_capacity: 100 },
    { vehicle_number: 'UK18TA1680', make: 'Bus', model: 'School Bus', year: 2018, fuel_type: 'diesel', subsidiary: 'Shri Sai Public School, Kashipur', tank_capacity: 100 },
    { vehicle_number: 'UK18PA0440', make: 'Bus', model: 'School Bus', year: 2018, fuel_type: 'diesel', subsidiary: 'Shri Sai Public School, Kashipur', tank_capacity: 100 },
    { vehicle_number: 'NB-3', make: 'Bus', model: 'School Bus', year: 2020, fuel_type: 'diesel', subsidiary: 'Shri Sai Public School, Kashipur', tank_capacity: 100 },
    
    // Sai Public School vehicles
    { vehicle_number: 'UK18PA0048', make: 'Bus', model: 'School Bus', year: 2018, fuel_type: 'diesel', subsidiary: 'Sai Public School, Kashipur', tank_capacity: 100 },
    { vehicle_number: 'UK18PA0049', make: 'Bus', model: 'School Bus', year: 2018, fuel_type: 'diesel', subsidiary: 'Sai Public School, Kashipur', tank_capacity: 100 },
    { vehicle_number: 'UK18PA0050', make: 'Bus', model: 'School Bus', year: 2018, fuel_type: 'diesel', subsidiary: 'Sai Public School, Kashipur', tank_capacity: 100 },
    { vehicle_number: 'UK18PA0051', make: 'Bus', model: 'School Bus', year: 2018, fuel_type: 'diesel', subsidiary: 'Sai Public School, Kashipur', tank_capacity: 100 },
    { vehicle_number: 'UK18PA0052', make: 'Bus', model: 'School Bus', year: 2018, fuel_type: 'diesel', subsidiary: 'Sai Public School, Kashipur', tank_capacity: 100 },
    { vehicle_number: 'UK18PA0119', make: 'Bus', model: 'School Bus', year: 2018, fuel_type: 'diesel', subsidiary: 'Sai Public School, Kashipur', tank_capacity: 100 },
    { vehicle_number: 'UK18PA0138', make: 'Bus', model: 'School Bus', year: 2018, fuel_type: 'diesel', subsidiary: 'Sai Public School, Kashipur', tank_capacity: 100 },
    { vehicle_number: 'UK18PA0441', make: 'Bus', model: 'School Bus', year: 2018, fuel_type: 'diesel', subsidiary: 'Sai Public School, Kashipur', tank_capacity: 100 },
    { vehicle_number: 'UK18PA0442', make: 'Bus', model: 'School Bus', year: 2018, fuel_type: 'diesel', subsidiary: 'Sai Public School, Kashipur', tank_capacity: 100 },
    { vehicle_number: 'UK18PA0443', make: 'Bus', model: 'School Bus', year: 2018, fuel_type: 'diesel', subsidiary: 'Sai Public School, Kashipur', tank_capacity: 100 },
    { vehicle_number: 'NB-1', make: 'Bus', model: 'School Bus', year: 2020, fuel_type: 'diesel', subsidiary: 'Sai Public School, Kashipur', tank_capacity: 100 },
    { vehicle_number: 'NB-2', make: 'Bus', model: 'School Bus', year: 2020, fuel_type: 'diesel', subsidiary: 'Sai Public School, Kashipur', tank_capacity: 100 },
    { vehicle_number: 'UK18TA0301', make: 'Bus', model: 'School Bus', year: 2018, fuel_type: 'diesel', subsidiary: 'Sai Public School, Kashipur', tank_capacity: 100 },
    { vehicle_number: 'UK18TA0302', make: 'Bus', model: 'School Bus', year: 2018, fuel_type: 'diesel', subsidiary: 'Sai Public School, Kashipur', tank_capacity: 100 },
    { vehicle_number: 'UK18TA0298', make: 'Bus', model: 'School Bus', year: 2018, fuel_type: 'diesel', subsidiary: 'Sai Public School, Kashipur', tank_capacity: 100 },
    { vehicle_number: 'UK18TA0305', make: 'Bus', model: 'School Bus', year: 2018, fuel_type: 'diesel', subsidiary: 'Sai Public School, Kashipur', tank_capacity: 100 },
    { vehicle_number: 'UK18TA0304', make: 'Bus', model: 'School Bus', year: 2018, fuel_type: 'diesel', subsidiary: 'Sai Public School, Kashipur', tank_capacity: 100 },
    { vehicle_number: 'UK18B5840', make: 'Bus', model: 'School Bus', year: 2018, fuel_type: 'diesel', subsidiary: 'Sai Public School, Kashipur', tank_capacity: 100 },
    { vehicle_number: 'UK18B6131', make: 'Bus', model: 'School Bus', year: 2018, fuel_type: 'diesel', subsidiary: 'Sai Public School, Kashipur', tank_capacity: 100 },
    { vehicle_number: 'UK06V8218', make: 'Maruti', model: 'Eeco', year: 2006, fuel_type: 'petrol', subsidiary: 'Sai Public School, Kashipur', tank_capacity: 45 }
  ],
  drivers: [
    // Shri Sai Public School drivers
    { name: 'TRILOK', phone: '9105660989', default_vehicle: 'UK06PA0284', subsidiary: 'Shri Sai Public School, Kashipur' },
    { name: 'RAJKUMAR', phone: '7248163033', default_vehicle: 'UK06PA0305', subsidiary: 'Shri Sai Public School, Kashipur' },
    { name: 'RAM SINGH', phone: '9690589315', default_vehicle: 'UK18TA1680', subsidiary: 'Shri Sai Public School, Kashipur' },
    { name: 'NISHAN SINGH', phone: '9756936006', default_vehicle: 'UK18PA0440', subsidiary: 'Shri Sai Public School, Kashipur' },
    { name: 'BHUWAN', phone: '7500736931', default_vehicle: 'NB-3', subsidiary: 'Shri Sai Public School, Kashipur' },
    
    // Sai Public School drivers
    { name: 'JARNAIL SINGH', phone: '8193074246', default_vehicle: 'UK18PA0048', subsidiary: 'Sai Public School, Kashipur' },
    { name: 'BALKAR SINGH', phone: '9756613177', default_vehicle: 'UK18PA0049', subsidiary: 'Sai Public School, Kashipur' },
    { name: 'BALWINDER SINGH', phone: '8392914710', default_vehicle: 'UK18PA0050', subsidiary: 'Sai Public School, Kashipur' },
    { name: 'RESHAM SINGH', phone: '8392914701', default_vehicle: 'UK18PA0051', subsidiary: 'Sai Public School, Kashipur' },
    { name: 'JOGA', phone: '7253095679', default_vehicle: 'UK18PA0052', subsidiary: 'Sai Public School, Kashipur' },
    { name: 'SUNIL KUMAR', phone: '9568361597', default_vehicle: 'UK18PA0119', subsidiary: 'Sai Public School, Kashipur' },
    { name: 'JOGA SINGH', phone: '9837921523', default_vehicle: 'UK18PA0138', subsidiary: 'Sai Public School, Kashipur' },
    { name: 'MANJEET SEKHON', phone: '8392914709', default_vehicle: 'UK18PA0441', subsidiary: 'Sai Public School, Kashipur' },
    { name: 'SHAMSHER SINGH', phone: '8392914705', default_vehicle: 'UK18PA0442', subsidiary: 'Sai Public School, Kashipur' },
    { name: 'TARSEM SINGH', phone: '8392914704', default_vehicle: 'UK18PA0443', subsidiary: 'Sai Public School, Kashipur' },
    { name: 'DEVENDER', phone: '9012990972', default_vehicle: 'NB-1', subsidiary: 'Sai Public School, Kashipur' },
    { name: 'CHARAN SINGH', phone: '9837082812', default_vehicle: 'NB-2', subsidiary: 'Sai Public School, Kashipur' },
    { name: 'GURLAL SINGH', phone: '8392914707', default_vehicle: 'UK18TA0301', subsidiary: 'Sai Public School, Kashipur' },
    { name: 'DEEPAK KUMAR', phone: '9639281108', default_vehicle: 'UK18TA0302', subsidiary: 'Sai Public School, Kashipur' },
    { name: 'KEDARNATH', phone: '8392914706', default_vehicle: 'UK18TA0298', subsidiary: 'Sai Public School, Kashipur' },
    { name: 'DALJINDER SINGH', phone: '8392914703', default_vehicle: 'UK18TA0305', subsidiary: 'Sai Public School, Kashipur' },
    { name: 'VIPIN', phone: '8392914708', default_vehicle: 'UK18TA0304', subsidiary: 'Sai Public School, Kashipur' },
    { name: 'KISHORE KUMAR', phone: '8958596686', default_vehicle: 'UK18B5840', subsidiary: 'Sai Public School, Kashipur' },
    { name: 'GURNAM SINGH', phone: '8392914702', default_vehicle: 'UK18B6131', subsidiary: 'Sai Public School, Kashipur' },
    { name: 'SUNIL MAURYA 2', phone: '7088249660', default_vehicle: 'UK06V8218', subsidiary: 'Sai Public School, Kashipur' }
  ]
};

export function BulkImportDialog({ open, onOpenChange, onSuccess }: BulkImportDialogProps) {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const handleImport = async () => {
    setImporting(true);
    setProgress(0);
    setResult(null);

    try {
      // Get current user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('User profile not found');

      const result: ImportResult = {
        vehicles: { success: 0, errors: [] },
        drivers: { success: 0, errors: [] }
      };

      // Import vehicles
      setCurrentStep('Importing vehicles...');
      setProgress(10);

      for (let i = 0; i < SPS_DATA.vehicles.length; i++) {
        const vehicle = SPS_DATA.vehicles[i];
        
        try {
          // Check if vehicle already exists
          const { data: existing } = await supabase
            .from('vehicles')
            .select('id')
            .eq('vehicle_number', vehicle.vehicle_number)
            .single();

          if (existing) {
            result.vehicles.errors.push(`Vehicle ${vehicle.vehicle_number} already exists`);
            continue;
          }

          const subsidiaryId = SPS_DATA.subsidiaries[vehicle.subsidiary];
          const purchaseDate = new Date(vehicle.year, 0, 1);

          const { error } = await supabase
            .from('vehicles')
            .insert({
              vehicle_number: vehicle.vehicle_number,
              make: vehicle.make,
              model: vehicle.model,
              year: vehicle.year,
              fuel_type: vehicle.fuel_type as any,
              fuel_types: [vehicle.fuel_type],
              default_fuel_type: vehicle.fuel_type,
              tank_capacity: vehicle.tank_capacity,
              tank_capacity_diesel: vehicle.fuel_type === 'diesel' ? vehicle.tank_capacity : null,
              tank_capacity_petrol: vehicle.fuel_type === 'petrol' ? vehicle.tank_capacity : null,
              status: 'active',
              purchase_date: purchaseDate.toISOString().split('T')[0],
              subsidiary_id: subsidiaryId,
              created_by: profile.id
            });

          if (error) throw error;
          result.vehicles.success++;
        } catch (error: any) {
          result.vehicles.errors.push(`${vehicle.vehicle_number}: ${error.message}`);
        }

        setProgress(10 + (i / SPS_DATA.vehicles.length) * 40);
      }

      // Import drivers
      setCurrentStep('Importing drivers...');
      setProgress(50);

      // First, get all vehicle IDs for mapping
      const { data: vehicleMap } = await supabase
        .from('vehicles')
        .select('id, vehicle_number');

      const vehicleIdMap = vehicleMap?.reduce((acc, v) => {
        acc[v.vehicle_number] = v.id;
        return acc;
      }, {} as Record<string, string>) || {};

      for (let i = 0; i < SPS_DATA.drivers.length; i++) {
        const driver = SPS_DATA.drivers[i];
        
        try {
          // Check if driver already exists
          const { data: existing } = await supabase
            .from('drivers')
            .select('id')
            .eq('phone', driver.phone)
            .single();

          if (existing) {
            result.drivers.errors.push(`Driver ${driver.name} (${driver.phone}) already exists`);
            continue;
          }

          const subsidiaryId = SPS_DATA.subsidiaries[driver.subsidiary];
          const defaultVehicleId = vehicleIdMap[driver.default_vehicle];
          const licenseExpiry = new Date();
          licenseExpiry.setFullYear(licenseExpiry.getFullYear() + 1);

          const { error } = await supabase
            .from('drivers')
            .insert({
              name: driver.name,
              phone: driver.phone,
              address: 'Kashipur, Uttarakhand',
              license_number: `LIC${driver.phone.slice(-4)}`,
              license_expiry: licenseExpiry.toISOString().split('T')[0],
              is_active: true,
              subsidiary_id: subsidiaryId,
              created_by: profile.id
            });

          if (error) throw error;

          // Update vehicle with default driver if vehicle exists
          if (defaultVehicleId) {
            await supabase
              .from('vehicles')
              .update({ default_driver_id: (await supabase.from('drivers').select('id').eq('phone', driver.phone).single()).data?.id })
              .eq('id', defaultVehicleId);
          }

          result.drivers.success++;
        } catch (error: any) {
          result.drivers.errors.push(`${driver.name}: ${error.message}`);
        }

        setProgress(50 + (i / SPS_DATA.drivers.length) * 40);
      }

      setProgress(100);
      setCurrentStep('Import completed!');
      setResult(result);

      toast({
        title: 'Import Completed',
        description: `Successfully imported ${result.vehicles.success} vehicles and ${result.drivers.success} drivers`,
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Import Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            SPS Driver List 2025-2026 Bulk Import
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Data Preview */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Vehicles to Import
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Shri Sai Public School:</span>
                    <Badge variant="secondary">5 vehicles</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Sai Public School:</span>
                    <Badge variant="secondary">20 vehicles</Badge>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Total:</span>
                    <Badge>25 vehicles</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Drivers to Import
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Shri Sai Public School:</span>
                    <Badge variant="secondary">5 drivers</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Sai Public School:</span>
                    <Badge variant="secondary">20 drivers</Badge>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Total:</span>
                    <Badge>25 drivers</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Import Progress */}
          {importing && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{currentStep}</span>
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Import Results */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Import Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-green-600">Vehicles</h4>
                    <p className="text-sm">Successfully imported: {result.vehicles.success}</p>
                    {result.vehicles.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-red-600">Errors: {result.vehicles.errors.length}</p>
                        <div className="max-h-20 overflow-y-auto text-xs text-red-600">
                          {result.vehicles.errors.map((error, i) => (
                            <div key={i}>{error}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-green-600">Drivers</h4>
                    <p className="text-sm">Successfully imported: {result.drivers.success}</p>
                    {result.drivers.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-red-600">Errors: {result.drivers.errors.length}</p>
                        <div className="max-h-20 overflow-y-auto text-xs text-red-600">
                          {result.drivers.errors.map((error, i) => (
                            <div key={i}>{error}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warning */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This will import 25 vehicles and 25 drivers with their assignments. 
              Existing records with duplicate vehicle numbers or phone numbers will be skipped.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={importing}
              className="min-w-32"
            >
              {importing ? 'Importing...' : 'Start Import'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}