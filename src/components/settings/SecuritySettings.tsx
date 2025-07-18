import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Shield, Clock, Lock, AlertTriangle } from 'lucide-react';

interface SecuritySettingsProps {
  settings: any[];
  updateSetting: (key: string, value: any) => Promise<void>;
  getSettingValue: (key: string, defaultValue?: any) => any;
}

export function SecuritySettings({ updateSetting, getSettingValue }: SecuritySettingsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Session Timeout</Label>
            <Select
              value={getSettingValue('session_timeout', '240').toString()}
              onValueChange={(value) => updateSetting('session_timeout', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select session timeout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="240">4 hours</SelectItem>
                <SelectItem value="480">8 hours</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Users will be automatically logged out after this period of inactivity
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Password Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="min_password_length">Minimum Password Length</Label>
            <Input
              id="min_password_length"
              type="number"
              min="6"
              max="32"
              value={getSettingValue('min_password_length', 8)}
              onChange={(e) => updateSetting('min_password_length', parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Uppercase Letters</Label>
                <p className="text-sm text-muted-foreground">
                  Passwords must contain at least one uppercase letter
                </p>
              </div>
              <Switch
                checked={getSettingValue('require_uppercase', true)}
                onCheckedChange={(checked) => updateSetting('require_uppercase', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Numbers</Label>
                <p className="text-sm text-muted-foreground">
                  Passwords must contain at least one number
                </p>
              </div>
              <Switch
                checked={getSettingValue('require_numbers', true)}
                onCheckedChange={(checked) => updateSetting('require_numbers', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Special Characters</Label>
                <p className="text-sm text-muted-foreground">
                  Passwords must contain at least one special character
                </p>
              </div>
              <Switch
                checked={getSettingValue('require_special_chars', true)}
                onCheckedChange={(checked) => updateSetting('require_special_chars', checked)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password_expiry">Password Expiry (Days)</Label>
            <Input
              id="password_expiry"
              type="number"
              min="0"
              value={getSettingValue('password_expiry_days', 0)}
              onChange={(e) => updateSetting('password_expiry_days', parseInt(e.target.value))}
            />
            <p className="text-sm text-muted-foreground">
              Set to 0 for passwords that never expire
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Account Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="failed_login_limit">Failed Login Attempts Limit</Label>
              <Input
                id="failed_login_limit"
                type="number"
                min="3"
                max="10"
                value={getSettingValue('failed_login_limit', 5)}
                onChange={(e) => updateSetting('failed_login_limit', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Account Lockout Duration</Label>
              <Select
                value={getSettingValue('lockout_duration', '30').toString()}
                onValueChange={(value) => updateSetting('lockout_duration', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lockout duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200">Security Notice</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  These security settings affect all users in the system. Changes will be applied immediately.
                  Ensure all users are aware of any password policy changes.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}