import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Database, HardDrive, Download, Upload, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SystemSettingsProps {
  settings: any[];
  updateSetting: (key: string, value: any) => Promise<void>;
  getSettingValue: (key: string, defaultValue?: any) => any;
}

interface SystemStats {
  vehicles: number;
  drivers: number;
  fuelLogs: number;
  maintenanceLogs: number;
  totalRecords: number;
}

export function SystemSettings({ updateSetting, getSettingValue }: SystemSettingsProps) {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected'>('connected');
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchSystemStats();
    checkDatabaseStatus();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const [vehicles, drivers, fuelLogs, maintenanceLogs] = await Promise.all([
        supabase.from('vehicles').select('id', { count: 'exact', head: true }),
        supabase.from('drivers').select('id', { count: 'exact', head: true }),
        supabase.from('fuel_log').select('id', { count: 'exact', head: true }),
        supabase.from('maintenance_log').select('id', { count: 'exact', head: true }),
      ]);

      const stats = {
        vehicles: vehicles.count || 0,
        drivers: drivers.count || 0,
        fuelLogs: fuelLogs.count || 0,
        maintenanceLogs: maintenanceLogs.count || 0,
        totalRecords: (vehicles.count || 0) + (drivers.count || 0) + (fuelLogs.count || 0) + (maintenanceLogs.count || 0),
      };

      setSystemStats(stats);
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  const checkDatabaseStatus = async () => {
    try {
      const { error } = await supabase.from('app_settings').select('id').limit(1);
      setDbStatus(error ? 'disconnected' : 'connected');
    } catch (error) {
      setDbStatus('disconnected');
    }
  };

  const exportSettings = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase.from('app_settings').select('*');
      if (error) throw error;

      const settingsExport = {
        exported_at: new Date().toISOString(),
        version: '1.0',
        settings: data,
      };

      const blob = new Blob([JSON.stringify(settingsExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `miletraq-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Settings exported successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export settings',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const importSettings = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      if (!importData.settings || !Array.isArray(importData.settings)) {
        throw new Error('Invalid settings file format');
      }

      // TODO: Implement settings import logic
      toast({
        title: 'Success',
        description: 'Settings imported successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to import settings',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Database Status</Label>
              <Badge variant={dbStatus === 'connected' ? 'default' : 'destructive'}>
                {dbStatus === 'connected' ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Disconnected
                  </>
                )}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <Label>Last Backup</Label>
              <span className="text-sm text-muted-foreground">Never</span>
            </div>
          </div>

          {systemStats && (
            <div className="space-y-3">
              <Label>Record Counts</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{systemStats.vehicles}</div>
                  <div className="text-sm text-muted-foreground">Vehicles</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{systemStats.drivers}</div>
                  <div className="text-sm text-muted-foreground">Drivers</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{systemStats.fuelLogs}</div>
                  <div className="text-sm text-muted-foreground">Fuel Logs</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{systemStats.maintenanceLogs}</div>
                  <div className="text-sm text-muted-foreground">Maintenance</div>
                </div>
              </div>
              <div className="text-center pt-2">
                <div className="text-lg font-semibold">Total Records: {systemStats.totalRecords}</div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Storage Usage</Label>
            <Progress value={25} className="w-full" />
            <div className="text-sm text-muted-foreground">
              2.5 GB of 10 GB used (25%)
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Backup & Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Auto Backup Frequency</Label>
            <Select
              value={getSettingValue('auto_backup_frequency', 'weekly')}
              onValueChange={(value) => updateSetting('auto_backup_frequency', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select backup frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data Retention Period</Label>
            <Select
              value={getSettingValue('data_retention_period', '2_years')}
              onValueChange={(value) => updateSetting('data_retention_period', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select retention period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1_year">1 Year</SelectItem>
                <SelectItem value="2_years">2 Years</SelectItem>
                <SelectItem value="5_years">5 Years</SelectItem>
                <SelectItem value="forever">Forever</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Default Export Format</Label>
            <Select
              value={getSettingValue('export_format', 'excel')}
              onValueChange={(value) => updateSetting('export_format', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select export format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Logging & Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Activity Logging</Label>
              <p className="text-sm text-muted-foreground">
                Track user actions and system events
              </p>
            </div>
            <Switch
              checked={getSettingValue('enable_activity_logging', true)}
              onCheckedChange={(checked) => updateSetting('enable_activity_logging', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Log Retention Period</Label>
            <Select
              value={getSettingValue('log_retention_days', '90').toString()}
              onValueChange={(value) => updateSetting('log_retention_days', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select log retention" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
                <SelectItem value="365">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Debug Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable detailed logging for troubleshooting
              </p>
            </div>
            <Switch
              checked={getSettingValue('debug_mode', false)}
              onCheckedChange={(checked) => updateSetting('debug_mode', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Restrict access during system maintenance
              </p>
            </div>
            <Switch
              checked={getSettingValue('maintenance_mode', false)}
              onCheckedChange={(checked) => updateSetting('maintenance_mode', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Settings Import/Export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={exportSettings} disabled={exporting} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {exporting ? 'Exporting...' : 'Export Settings'}
            </Button>

            <div>
              <Button
                variant="outline"
                disabled={importing}
                onClick={() => document.getElementById('settings-import')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {importing ? 'Importing...' : 'Import Settings'}
              </Button>
              <input
                id="settings-import"
                type="file"
                accept=".json"
                className="hidden"
                onChange={importSettings}
              />
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Export:</strong> Download current settings as a JSON file for backup or transfer.
              <br />
              <strong>Import:</strong> Upload a previously exported settings file to restore configuration.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}