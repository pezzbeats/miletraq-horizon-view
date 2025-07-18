import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings as SettingsIcon, Shield, Bell, Database, Monitor, Wrench } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { GeneralSettings } from '@/components/settings/GeneralSettings';
import { ThemeSettings } from '@/components/settings/ThemeSettings';
import { FleetSettings } from '@/components/settings/FleetSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import { SystemSettings } from '@/components/settings/SystemSettings';
import { SubsidiarySettings } from '@/components/settings/SubsidiarySettings';

interface Setting {
  setting_key: string;
  setting_value: any;
  category: string;
  description: string;
}

export default function Settings() {
  const { profile, hasPermission } = useAuth();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      const { error } = await supabase.rpc('update_setting', {
        setting_key: key,
        setting_value: JSON.stringify(value),
      });

      if (error) throw error;

      // Update local state
      setSettings(prev => 
        prev.map(setting => 
          setting.setting_key === key 
            ? { ...setting, setting_value: value }
            : setting
        )
      );

      toast({
        title: 'Success',
        description: 'Setting updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating setting:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update setting',
        variant: 'destructive',
      });
    }
  };

  const getSettingValue = (key: string, defaultValue?: any) => {
    const setting = settings.find(s => s.setting_key === key);
    return setting ? setting.setting_value : defaultValue;
  };

  const canAccessTab = (tab: string) => {
    switch (tab) {
      case 'subsidiaries':
      case 'security':
      case 'system':
        return hasPermission('admin');
      case 'general':
      case 'theme':
      case 'fleet':
      case 'notifications':
        return hasPermission('manager');
      default:
        return true;
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon, description: 'App name, company details, formats' },
    { id: 'theme', label: 'Theme', icon: Monitor, description: 'Display preferences and themes' },
    { id: 'fleet', label: 'Fleet', icon: Wrench, description: 'Fleet and vehicle configurations' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alert preferences and recipients' },
    { id: 'subsidiaries', label: 'Subsidiaries', icon: Database, description: 'Manage business subsidiaries and units' },
    { id: 'security', label: 'Security', icon: Shield, description: 'Password policies and session settings' },
    { id: 'system', label: 'System', icon: Database, description: 'Backup, logging, and maintenance' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure application preferences and system settings
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {profile?.role?.replace('_', ' ').toUpperCase()} ACCESS
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Settings Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <TabsList className="flex flex-col h-auto w-full space-y-1 bg-transparent p-2">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      disabled={!canAccessTab(tab.id)}
                      className="w-full justify-start gap-3 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <tab.icon className="h-4 w-4" />
                      <div className="text-left flex-1">
                        <div className="font-medium">{tab.label}</div>
                        <div className="text-xs opacity-70 font-normal">
                          {tab.description}
                        </div>
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <TabsContent value="general" className="mt-0">
              <GeneralSettings
                settings={settings}
                updateSetting={updateSetting}
                getSettingValue={getSettingValue}
              />
            </TabsContent>

            <TabsContent value="theme" className="mt-0">
              <ThemeSettings
                settings={settings}
                updateSetting={updateSetting}
                getSettingValue={getSettingValue}
              />
            </TabsContent>

            <TabsContent value="fleet" className="mt-0">
              <FleetSettings
                settings={settings}
                updateSetting={updateSetting}
                getSettingValue={getSettingValue}
              />
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <NotificationSettings
                settings={settings}
                updateSetting={updateSetting}
                getSettingValue={getSettingValue}
              />
            </TabsContent>

            <TabsContent value="subsidiaries" className="mt-0">
              <SubsidiarySettings />
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <SecuritySettings
                settings={settings}
                updateSetting={updateSetting}
                getSettingValue={getSettingValue}
              />
            </TabsContent>

            <TabsContent value="system" className="mt-0">
              <SystemSettings
                settings={settings}
                updateSetting={updateSetting}
                getSettingValue={getSettingValue}
              />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}