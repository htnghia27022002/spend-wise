import { Head, router, useForm } from '@inertiajs/react';
import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs = [
  { title: 'Notifications', href: '/notifications' },
  { title: 'Templates', href: '/notifications/templates' },
  { title: 'Edit', href: '#' },
];

interface Template {
  id: number;
  name: string;
  type: string;
  channel: string;
  subject?: string;
  body: string;
  variables?: string[];
  is_active: boolean;
  is_default: boolean;
}

interface Props {
  template: Template;
  availableTypes: Record<string, any[]>;
}

export default function Edit({ template, availableTypes }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    name: template.name,
    type: template.type,
    channel: template.channel,
    subject: template.subject || '',
    body: template.body,
    variables: template.variables || [],
    is_active: template.is_active,
    is_default: template.is_default,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/notifications/templates/${template.id}`, {
      onSuccess: () => {
        router.visit('/notifications/templates');
      },
    });
  };

  const commonVariables = [
    { key: 'user_name', description: 'User name' },
    { key: 'user_email', description: 'User email' },
    { key: 'title', description: 'Notification title' },
    { key: 'message', description: 'Notification message' },
    { key: 'action_url', description: 'Action URL' },
    { key: 'amount', description: 'Amount (for finance notifications)' },
    { key: 'due_date', description: 'Due date' },
    { key: 'subscription_name', description: 'Subscription name' },
    { key: 'installment_name', description: 'Installment name' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Template: ${template.name}`} />

      <div className="mx-auto max-w-4xl flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Template</h1>
          <p className="text-muted-foreground mt-2">Update notification template</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
              <CardDescription>Basic information about the template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  required
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Notification Type *</Label>
                  <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(availableTypes).map(([module, types]) => (
                        <div key={module}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                            {module}
                          </div>
                          {types.map((type: any) => (
                            <SelectItem key={type.type} value={type.type}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="channel">Channel *</Label>
                  <Select value={data.channel} onValueChange={(value) => setData('channel', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="push">Push Notification</SelectItem>
                      <SelectItem value="database">In-App (Database)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_active"
                    checked={data.is_active}
                    onCheckedChange={(checked) => setData('is_active', !!checked)}
                  />
                  <Label htmlFor="is_active" className="cursor-pointer font-normal">
                    Active
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_default"
                    checked={data.is_default}
                    onCheckedChange={(checked) => setData('is_default', !!checked)}
                  />
                  <Label htmlFor="is_default" className="cursor-pointer font-normal">
                    Set as default template
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Template Content</CardTitle>
              <CardDescription>
                Message content with variable placeholders (use {`{{variable_name}}`})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.channel === 'email' && (
                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject *</Label>
                  <Input
                    id="subject"
                    value={data.subject}
                    onChange={(e) => setData('subject', e.target.value)}
                    placeholder="e.g., {{subscription_name}} is due on {{due_date}}"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="body">Message Body *</Label>
                <Textarea
                  id="body"
                  value={data.body}
                  onChange={(e) => setData('body', e.target.value)}
                  rows={8}
                  required
                />
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Available Variables:</p>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {commonVariables.map((variable) => (
                        <div key={variable.key} className="text-sm">
                          <Badge variant="outline" className="font-mono text-xs">
                            {`{{${variable.key}}}`}
                          </Badge>
                          <span className="ml-2 text-muted-foreground">{variable.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.visit('/notifications/templates')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={processing}>
              Update Template
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
