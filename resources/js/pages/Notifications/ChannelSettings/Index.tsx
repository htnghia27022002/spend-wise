import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle2, XCircle, Loader2, Mail, MessageSquare, Bell } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

const breadcrumbs = [
  { title: 'Notifications', href: '/notifications' },
  { title: 'Channel Settings', href: '/notifications/channels' },
];

interface ChannelSetting {
  id: number;
  channel: string;
  name: string;
  description?: string;
  is_active: boolean;
  configuration: Record<string, any>;
  last_tested_at?: string;
  test_successful?: boolean;
  test_error?: string;
}

interface Props {
  settings: ChannelSetting[];
}

export default function Index({ settings }: Props) {
  const [activeTab, setActiveTab] = useState('email');
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  const getChannelSetting = (channel: string) => {
    return settings.find((s) => s.channel === channel);
  };

  const handleTest = async (channel: string) => {
    setTesting(channel);
    try {
      const response = await fetch(`/notifications/channels/${channel}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN':
            document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });
      const result = await response.json();
      setTestResults({ ...testResults, [channel]: result });
    } catch (error) {
      setTestResults({
        ...testResults,
        [channel]: { success: false, message: 'Test failed' },
      });
    } finally {
      setTesting(null);
      router.reload({ only: ['settings'] });
    }
  };

  const tabs = [
    { id: 'email', label: 'Email (SMTP)', icon: Mail },
    { id: 'sms', label: 'SMS', icon: MessageSquare },
    { id: 'push', label: 'Push', icon: Bell },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Channel Settings" />

      <div className="mx-auto max-w-6xl flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Channel Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure notification delivery channels (Email, SMS, Push)
          </p>
        </div>

        {/* Custom Tabs */}
        <div className="space-y-6">
          <div className="inline-flex gap-1 rounded-lg bg-muted p-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                  activeTab === id
                    ? 'bg-background shadow-sm'
                    : 'text-muted-foreground hover:bg-background/60'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'email' && (
            <EmailChannelForm
              setting={getChannelSetting('email')}
              onTest={() => handleTest('email')}
              testing={testing === 'email'}
              testResult={testResults['email']}
            />
          )}

          {activeTab === 'sms' && (
            <SmsChannelForm
              setting={getChannelSetting('sms')}
              onTest={() => handleTest('sms')}
              testing={testing === 'sms'}
              testResult={testResults['sms']}
            />
          )}

          {activeTab === 'push' && (
            <PushChannelForm
              setting={getChannelSetting('push')}
              onTest={() => handleTest('push')}
              testing={testing === 'push'}
              testResult={testResults['push']}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}

interface ChannelFormProps {
  setting?: ChannelSetting;
  onTest: () => void;
  testing: boolean;
  testResult?: { success: boolean; message: string };
}

function EmailChannelForm({ setting, onTest, testing, testResult }: ChannelFormProps) {
  const { data, setData, post, put, processing } = useForm({
    channel: 'email',
    name: setting?.name || 'Email (SMTP)',
    description: setting?.description || 'Send notifications via SMTP email',
    is_active: setting?.is_active || false,
    configuration: {
      host: setting?.configuration?.host || '',
      port: setting?.configuration?.port || '587',
      username: setting?.configuration?.username || '',
      password: setting?.configuration?.password || '',
      encryption: setting?.configuration?.encryption || 'tls',
      from_address: setting?.configuration?.from_address || '',
      from_name: setting?.configuration?.from_name || 'SpendWise',
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (setting) {
      put(`/notifications/channels/${data.channel}`);
    } else {
      post('/notifications/channels');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>SMTP Configuration</CardTitle>
              <CardDescription>Configure SMTP server for email notifications</CardDescription>
            </div>
            {setting && (
              <Badge variant={setting.is_active ? 'default' : 'secondary'}>
                {setting.is_active ? 'Active' : 'Inactive'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test Status */}
          {setting?.last_tested_at && (
            <Alert variant={setting.test_successful ? 'default' : 'destructive'}>
              <div className="flex items-center gap-2">
                {setting.test_successful ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  Last tested: {new Date(setting.last_tested_at).toLocaleString()}
                  {setting.test_error && ` - ${setting.test_error}`}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Test Result */}
          {testResult && (
            <Alert variant={testResult.success ? 'default' : 'destructive'}>
              <AlertDescription>{testResult.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              id="email-active"
              checked={data.is_active}
              onCheckedChange={(checked) => setData('is_active', !!checked)}
            />
            <Label htmlFor="email-active" className="cursor-pointer font-normal">
              Enable email notifications
            </Label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email-host">SMTP Host *</Label>
              <Input
                id="email-host"
                value={data.configuration.host}
                onChange={(e) =>
                  setData('configuration', { ...data.configuration, host: e.target.value })
                }
                placeholder="smtp.gmail.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-port">Port *</Label>
              <Input
                id="email-port"
                value={data.configuration.port}
                onChange={(e) =>
                  setData('configuration', { ...data.configuration, port: e.target.value })
                }
                placeholder="587"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-encryption">Encryption</Label>
            <Select
              value={data.configuration.encryption}
              onValueChange={(value) =>
                setData('configuration', { ...data.configuration, encryption: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tls">TLS</SelectItem>
                <SelectItem value="ssl">SSL</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email-username">Username *</Label>
              <Input
                id="email-username"
                value={data.configuration.username}
                onChange={(e) =>
                  setData('configuration', { ...data.configuration, username: e.target.value })
                }
                placeholder="user@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-password">Password *</Label>
              <Input
                id="email-password"
                type="password"
                value={data.configuration.password}
                onChange={(e) =>
                  setData('configuration', { ...data.configuration, password: e.target.value })
                }
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email-from-address">From Address *</Label>
              <Input
                id="email-from-address"
                value={data.configuration.from_address}
                onChange={(e) =>
                  setData('configuration', { ...data.configuration, from_address: e.target.value })
                }
                placeholder="noreply@spendwise.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-from-name">From Name</Label>
              <Input
                id="email-from-name"
                value={data.configuration.from_name}
                onChange={(e) =>
                  setData('configuration', { ...data.configuration, from_name: e.target.value })
                }
                placeholder="SpendWise"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onTest} disabled={testing || processing}>
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
            <Button type="submit" disabled={processing}>
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

function SmsChannelForm({ setting, onTest, testing, testResult }: ChannelFormProps) {
  const { data, setData, post, put, processing } = useForm({
    channel: 'sms',
    name: setting?.name || 'SMS',
    description: setting?.description || 'Send notifications via SMS',
    is_active: setting?.is_active || false,
    configuration: {
      provider: setting?.configuration?.provider || 'twilio',
      account_sid: setting?.configuration?.account_sid || '',
      auth_token: setting?.configuration?.auth_token || '',
      from_number: setting?.configuration?.from_number || '',
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (setting) {
      put(`/notifications/channels/${data.channel}`);
    } else {
      post('/notifications/channels');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>SMS Configuration</CardTitle>
              <CardDescription>Configure SMS provider for notifications</CardDescription>
            </div>
            {setting && (
              <Badge variant={setting.is_active ? 'default' : 'secondary'}>
                {setting.is_active ? 'Active' : 'Inactive'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {testResult && (
            <Alert variant={testResult.success ? 'default' : 'destructive'}>
              <AlertDescription>{testResult.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              id="sms-active"
              checked={data.is_active}
              onCheckedChange={(checked) => setData('is_active', !!checked)}
            />
            <Label htmlFor="sms-active" className="cursor-pointer font-normal">
              Enable SMS notifications
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sms-provider">Provider</Label>
            <Select
              value={data.configuration.provider}
              onValueChange={(value) =>
                setData('configuration', { ...data.configuration, provider: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twilio">Twilio</SelectItem>
                <SelectItem value="nexmo">Nexmo</SelectItem>
                <SelectItem value="aws-sns">AWS SNS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sms-account-sid">Account SID *</Label>
            <Input
              id="sms-account-sid"
              value={data.configuration.account_sid}
              onChange={(e) =>
                setData('configuration', { ...data.configuration, account_sid: e.target.value })
              }
              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sms-auth-token">Auth Token *</Label>
            <Input
              id="sms-auth-token"
              type="password"
              value={data.configuration.auth_token}
              onChange={(e) =>
                setData('configuration', { ...data.configuration, auth_token: e.target.value })
              }
              placeholder="••••••••"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sms-from-number">From Number *</Label>
            <Input
              id="sms-from-number"
              value={data.configuration.from_number}
              onChange={(e) =>
                setData('configuration', { ...data.configuration, from_number: e.target.value })
              }
              placeholder="+1234567890"
              required
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onTest} disabled={testing || processing}>
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
            <Button type="submit" disabled={processing}>
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

function PushChannelForm({ setting, onTest, testing, testResult }: ChannelFormProps) {
  const { data, setData, post, put, processing } = useForm({
    channel: 'push',
    name: setting?.name || 'Push Notifications',
    description: setting?.description || 'Send push notifications',
    is_active: setting?.is_active || false,
    configuration: {
      provider: setting?.configuration?.provider || 'fcm',
      api_key: setting?.configuration?.api_key || '',
      sender_id: setting?.configuration?.sender_id || '',
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (setting) {
      put(`/notifications/channels/${data.channel}`);
    } else {
      post('/notifications/channels');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Push Notification Configuration</CardTitle>
              <CardDescription>Configure push notification provider</CardDescription>
            </div>
            {setting && (
              <Badge variant={setting.is_active ? 'default' : 'secondary'}>
                {setting.is_active ? 'Active' : 'Inactive'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {testResult && (
            <Alert variant={testResult.success ? 'default' : 'destructive'}>
              <AlertDescription>{testResult.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              id="push-active"
              checked={data.is_active}
              onCheckedChange={(checked) => setData('is_active', !!checked)}
            />
            <Label htmlFor="push-active" className="cursor-pointer font-normal">
              Enable push notifications
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="push-provider">Provider</Label>
            <Select
              value={data.configuration.provider}
              onValueChange={(value) =>
                setData('configuration', { ...data.configuration, provider: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fcm">Firebase Cloud Messaging</SelectItem>
                <SelectItem value="apns">Apple Push Notification</SelectItem>
                <SelectItem value="onesignal">OneSignal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="push-api-key">API Key *</Label>
            <Input
              id="push-api-key"
              type="password"
              value={data.configuration.api_key}
              onChange={(e) =>
                setData('configuration', { ...data.configuration, api_key: e.target.value })
              }
              placeholder="••••••••"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="push-sender-id">Sender ID</Label>
            <Input
              id="push-sender-id"
              value={data.configuration.sender_id}
              onChange={(e) =>
                setData('configuration', { ...data.configuration, sender_id: e.target.value })
              }
              placeholder="123456789012"
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onTest} disabled={testing || processing}>
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
            <Button type="submit" disabled={processing}>
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
