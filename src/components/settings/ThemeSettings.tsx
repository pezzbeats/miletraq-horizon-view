import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Palette, Monitor, Sun, Moon, Type } from 'lucide-react';

interface ThemeSettingsProps {
  settings: any[];
  updateSetting: (key: string, value: any) => Promise<void>;
  getSettingValue: (key: string, defaultValue?: any) => any;
}

export function ThemeSettings({ updateSetting, getSettingValue }: ThemeSettingsProps) {
  const themeMode = getSettingValue('theme_mode', 'auto');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Theme Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme Mode</Label>
            <Select
              value={themeMode}
              onValueChange={(value) => updateSetting('theme_mode', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select theme mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Light Mode
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Dark Mode
                  </div>
                </SelectItem>
                <SelectItem value="auto">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Auto (Time-based)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {themeMode === 'auto' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="dark_start">Dark Mode Start Time</Label>
                <Input
                  id="dark_start"
                  type="time"
                  value={getSettingValue('dark_mode_start', '19:00')}
                  onChange={(e) => updateSetting('dark_mode_start', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="light_start">Light Mode Start Time</Label>
                <Input
                  id="light_start"
                  type="time"
                  value={getSettingValue('light_mode_start', '07:00')}
                  onChange={(e) => updateSetting('light_mode_start', e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Color & Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primary_color">Primary Color</Label>
            <div className="flex items-center gap-3">
              <Input
                id="primary_color"
                type="color"
                value={getSettingValue('primary_color', '#2563eb')}
                onChange={(e) => updateSetting('primary_color', e.target.value)}
                className="w-16 h-10 p-1 rounded-md"
              />
              <Input
                value={getSettingValue('primary_color', '#2563eb')}
                onChange={(e) => updateSetting('primary_color', e.target.value)}
                placeholder="#2563eb"
                className="flex-1"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Choose the primary brand color for your application
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Display Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Font Size</Label>
            <Select
              value={getSettingValue('font_size', 'medium')}
              onValueChange={(value) => updateSetting('font_size', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select font size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (14px)</SelectItem>
                <SelectItem value="medium">Medium (16px)</SelectItem>
                <SelectItem value="large">Large (18px)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Compact Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable dense layouts for more content on screen
              </p>
            </div>
            <Switch
              checked={getSettingValue('compact_mode', false)}
              onCheckedChange={(checked) => updateSetting('compact_mode', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}