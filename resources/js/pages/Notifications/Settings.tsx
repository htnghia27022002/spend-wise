import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { NotificationSetting } from '@/types/finance';

const breadcrumbs = [
  { title: 'Notifications', href: '/notifications' },
  { title: 'Settings', href: '/notifications/settings' },
];

interface AvailableNotificationType {
  type: string;
  name: string;
  description: string;
  channels: string[];
  default_enabled: boolean;
  configurable: boolean;
}

interface Props {
  settings: NotificationSetting;
  availableTypes: Record<string, AvailableNotificationType[]>;
}

export default function Settings({ settings, availableTypes }: Props) {
  const { data, setData, post, processing } = useForm({
    preferences: settings.preferences || {},
    enabled_channels: settings.enabled_channels || ['database'],
    quiet_hours_start: settings.quiet_hours_start || '',
    quiet_hours_end: settings.quiet_hours_end || '',
    timezone: settings.timezone || 'UTC',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/notifications/settings');
  };

  const toggleNotificationType = (type: string, enabled: boolean) => {
    setData('preferences', {
      ...data.preferences,
      [type]: enabled,
    });
  };

  const toggleChannel = (channel: string, enabled: boolean) => {
    if (enabled) {
      setData('enabled_channels', [...data.enabled_channels, channel]);
    } else {
      setData('enabled_channels', data.enabled_channels.filter((c) => c !== channel));
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Notification Settings" />

      <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-3xl font-bold">Notification Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your notification preferences and channels
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Notification Channels */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="channel-database"
                  checked={data.enabled_channels.includes('database')}
                  onCheckedChange={(checked) => toggleChannel('database', !!checked)}
                />
                <Label htmlFor="channel-database" className="cursor-pointer font-normal">
                  In-App Notifications (Database)
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="channel-email"
                  checked={data.enabled_channels.includes('email')}
                  onCheckedChange={(checked) => toggleChannel('email', !!checked)}
                />
                <Label htmlFor="channel-email" className="cursor-pointer font-normal">
                  Email Notifications
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="channel-sms"
                  checked={data.enabled_channels.includes('sms')}
                  onCheckedChange={(checked) => toggleChannel('sms', !!checked)}
                />
                <Label htmlFor="channel-sms" className="cursor-pointer font-normal">
                  SMS Notifications
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="channel-push"
                  checked={data.enabled_channels.includes('push')}
                  onCheckedChange={(checked) => toggleChannel('push', !!checked)}
                />
                <Label htmlFor="channel-push" className="cursor-pointer font-normal">
                  Push Notifications
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Notification Types by Module */}
          {Object.entries(availableTypes).map(([module, types]) => (
            <Card key={module}>
              <CardHeader>
                <CardTitle className="capitalize">{module} Notifications</CardTitle>
                <CardDescription>
                  Configure notification preferences for {module} module
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {types.map((type) => (
                  <div key={type.type} className="flex items-start gap-3">
                    <Checkbox
                      id={`type-${type.type}`}
                      checked={data.preferences[type.type] ?? type.default_enabled}
                      onCheckedChange={(checked) => toggleNotificationType(type.type, !!checked)}
                      disabled={!type.configurable}
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`type-${type.type}`}
                        className="cursor-pointer font-medium"
                      >
                        {type.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Channels: {type.channels.join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {/* Quiet Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Quiet Hours</CardTitle>
              <CardDescription>
                Don't send notifications during these hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiet_hours_start">Start Time</Label>
                  <Input
                    id="quiet_hours_start"
                    type="time"
                    value={data.quiet_hours_start}
                    onChange={(e) => setData('quiet_hours_start', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quiet_hours_end">End Time</Label>
                  <Input
                    id="quiet_hours_end"
                    type="time"
                    value={data.quiet_hours_end}
                    onChange={(e) => setData('quiet_hours_end', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={data.timezone}
                  onValueChange={(value) => setData('timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh</SelectItem>
                    <SelectItem value="America/New_York">America/New York</SelectItem>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                    <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="submit" disabled={processing}>
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
