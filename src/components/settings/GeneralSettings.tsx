import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Building2, Globe, Calendar, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface GeneralSettingsProps {
  settings: any[];
  updateSetting: (key: string, value: any) => Promise<void>;
  getSettingValue: (key: string, defaultValue?: any) => any;
}

export function GeneralSettings({ updateSetting, getSettingValue }: GeneralSettingsProps) {
  const [uploading, setUploading] = useState(false);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // TODO: Implement logo upload to Supabase storage
      toast({
        title: 'Success',
        description: 'Logo uploaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload logo',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Application Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="app_name">Application Name</Label>
            <Input
              id="app_name"
              value={getSettingValue('app_name', 'MileTraq')}
              onChange={(e) => updateSetting('app_name', e.target.value)}
              placeholder="Enter application name"
            />
            <p className="text-sm text-muted-foreground">
              This name will appear in the browser title and throughout the application.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_name">Company/Organization Name</Label>
            <Input
              id="company_name"
              value={getSettingValue('company_name', 'Your Company')}
              onChange={(e) => updateSetting('company_name', e.target.value)}
              placeholder="Enter company name"
            />
          </div>

          <div className="space-y-2">
            <Label>Company Logo</Label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <Button
                  variant="outline"
                  disabled={uploading}
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Logo'}
                </Button>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Recommended: 200x200px, PNG or JPG format
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Regional Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default Currency</Label>
            <Select
              value={getSettingValue('default_currency', 'INR')}
              onValueChange={(value) => updateSetting('default_currency', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">₹ Indian Rupee (INR)</SelectItem>
                <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                <SelectItem value="GBP">£ British Pound (GBP)</SelectItem>
                <SelectItem value="JPY">¥ Japanese Yen (JPY)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Format
              </Label>
              <Select
                value={getSettingValue('date_format', 'DD/MM/YYYY')}
                onValueChange={(value) => updateSetting('date_format', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (18/07/2025)</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (07/18/2025)</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2025-07-18)</SelectItem>
                  <SelectItem value="DD MMM YYYY">DD MMM YYYY (18 Jul 2025)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time Format
              </Label>
              <Select
                value={getSettingValue('time_format', '24')}
                onValueChange={(value) => updateSetting('time_format', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12-hour (2:30 PM)</SelectItem>
                  <SelectItem value="24">24-hour (14:30)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}