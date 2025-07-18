import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, Fuel, Gauge, FileText } from 'lucide-react';

interface FleetSettingsProps {
  settings: any[];
  updateSetting: (key: string, value: any) => Promise<void>;
  getSettingValue: (key: string, defaultValue?: any) => any;
}

export function FleetSettings({ updateSetting, getSettingValue }: FleetSettingsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5" />
            Fuel Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tank_capacity">Default Tank Capacity (Liters)</Label>
              <Input
                id="tank_capacity"
                type="number"
                value={getSettingValue('default_tank_capacity', 3000)}
                onChange={(e) => updateSetting('default_tank_capacity', parseInt(e.target.value))}
                placeholder="3000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel_threshold">Low Fuel Alert Threshold (Liters)</Label>
              <Input
                id="fuel_threshold"
                type="number"
                value={getSettingValue('low_fuel_threshold', 500)}
                onChange={(e) => updateSetting('low_fuel_threshold', parseInt(e.target.value))}
                placeholder="500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Default Fuel Type</Label>
            <Select
              value={getSettingValue('default_fuel_type', 'diesel')}
              onValueChange={(value) => updateSetting('default_fuel_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select fuel type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="petrol">Petrol</SelectItem>
                <SelectItem value="cng">CNG</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Measurement Units
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mileage Unit</Label>
              <Select
                value={getSettingValue('mileage_unit', 'km/L')}
                onValueChange={(value) => updateSetting('mileage_unit', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mileage unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="km/L">Kilometers per Liter (km/L)</SelectItem>
                  <SelectItem value="L/100km">Liters per 100km (L/100km)</SelectItem>
                  <SelectItem value="MPG">Miles per Gallon (MPG)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Distance Unit</Label>
              <Select
                value={getSettingValue('distance_unit', 'kilometers')}
                onValueChange={(value) => updateSetting('distance_unit', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select distance unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kilometers">Kilometers</SelectItem>
                  <SelectItem value="miles">Miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="alert_days">Default Alert Days Before Document Expiry</Label>
            <Input
              id="alert_days"
              type="number"
              value={getSettingValue('document_alert_days', 30)}
              onChange={(e) => updateSetting('document_alert_days', parseInt(e.target.value))}
              placeholder="30"
            />
            <p className="text-sm text-muted-foreground">
              Number of days before document expiry to show alerts
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Vehicle Defaults
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              These settings will be used as defaults when adding new vehicles to your fleet.
              You can always override these values for individual vehicles.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}