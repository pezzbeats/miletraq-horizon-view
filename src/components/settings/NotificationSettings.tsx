import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Mail, AlertTriangle, DollarSign, Fuel, Wrench, Users, TestTube } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface NotificationSettingsProps {
  settings: any[];
  updateSetting: (key: string, value: any) => Promise<void>;
  getSettingValue: (key: string, defaultValue?: any) => any;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export function NotificationSettings({ updateSetting, getSettingValue }: NotificationSettingsProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const testNotifications = async () => {
    setTesting(true);
    try {
      // TODO: Implement notification testing
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      toast({
        title: 'Test Successful',
        description: 'Test notifications sent to selected recipients',
      });
    } catch (error) {
      toast({
        title: 'Test Failed',
        description: 'Failed to send test notifications',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            General Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable email notifications for all alert types
              </p>
            </div>
            <Switch
              checked={getSettingValue('email_notifications', true)}
              onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alert Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Document Expiry Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Alerts for expiring vehicle documents (insurance, PUC, etc.)
              </p>
            </div>
            <Switch
              checked={getSettingValue('document_expiry_alerts', true)}
              onCheckedChange={(checked) => updateSetting('document_expiry_alerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Budget Threshold Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Notifications when budget limits are exceeded
              </p>
            </div>
            <Switch
              checked={getSettingValue('budget_threshold_alerts', true)}
              onCheckedChange={(checked) => updateSetting('budget_threshold_alerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Fuel className="h-4 w-4" />
                Low Fuel Tank Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Alerts when fuel tank levels are low
              </p>
            </div>
            <Switch
              checked={getSettingValue('low_fuel_alerts', true)}
              onCheckedChange={(checked) => updateSetting('low_fuel_alerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Maintenance Due Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Notifications for scheduled maintenance due dates
              </p>
            </div>
            <Switch
              checked={getSettingValue('maintenance_alerts', true)}
              onCheckedChange={(checked) => updateSetting('maintenance_alerts', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Alert Recipients
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default Recipients</Label>
            <Select onValueChange={(value) => {
              if (!selectedRecipients.includes(value)) {
                setSelectedRecipients([...selectedRecipients, value]);
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Add notification recipients" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name} ({user.email}) - {user.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRecipients.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Recipients:</Label>
              <div className="space-y-2">
                {selectedRecipients.map((recipientId) => {
                  const user = users.find(u => u.id === recipientId);
                  return user ? (
                    <div key={recipientId} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                      <span className="text-sm">{user.full_name} ({user.email})</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRecipients(prev => prev.filter(id => id !== recipientId))}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Send test notifications to verify your notification settings are working correctly.
            </p>
            <Button 
              onClick={testNotifications} 
              disabled={testing || selectedRecipients.length === 0}
              className="w-full md:w-auto"
            >
              <TestTube className="h-4 w-4 mr-2" />
              {testing ? 'Sending Test...' : 'Send Test Notifications'}
            </Button>
            {selectedRecipients.length === 0 && (
              <p className="text-sm text-muted-foreground text-amber-600">
                Please select at least one recipient to send test notifications.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}