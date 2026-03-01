import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EmailProvider {
    id: number;
    name: string;
    driver: string;
    config: Record<string, any>;
    is_active: boolean;
    is_default: boolean;
    priority: number;
    description: string | null;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    provider: EmailProvider | null;
}

export default function EmailProviderDialog({ open, onOpenChange, provider }: Props) {
    const [formData, setFormData] = useState<{
        name: string;
        driver: string;
        is_active: boolean;
        is_default: boolean;
        priority: number;
        description: string;
        config: Record<string, any>;
    }>({
        name: '',
        driver: 'smtp',
        is_active: true,
        is_default: false,
        priority: 0,
        description: '',
        config: {},
    });

    useEffect(() => {
        if (provider) {
            setFormData({
                name: provider.name,
                driver: provider.driver,
                is_active: provider.is_active,
                is_default: provider.is_default,
                priority: provider.priority,
                description: provider.description || '',
                config: provider.config,
            });
        } else {
            setFormData({
                name: '',
                driver: 'smtp',
                is_active: true,
                is_default: false,
                priority: 0,
                description: '',
                config: {},
            });
        }
    }, [provider, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (provider) {
            router.put(`/email/providers/${provider.id}`, formData, {
                onSuccess: () => onOpenChange(false),
            });
        } else {
            router.post('/email/providers', formData, {
                onSuccess: () => onOpenChange(false),
            });
        }
    };

    const handleDriverChange = (driver: string) => {
        setFormData({ ...formData, driver, config: {} });
    };

    const updateConfig = (key: string, value: any) => {
        setFormData({
            ...formData,
            config: { ...formData.config, [key]: value },
        });
    };

    const renderDriverConfig = () => {
        switch (formData.driver) {
            case 'smtp':
                return (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="smtp_host">SMTP Host</Label>
                            <Input
                                id="smtp_host"
                                value={formData.config.host || ''}
                                onChange={(e) => updateConfig('host', e.target.value)}
                                placeholder="smtp.gmail.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="smtp_port">Port</Label>
                            <Input
                                id="smtp_port"
                                type="number"
                                value={formData.config.port || 587}
                                onChange={(e) => updateConfig('port', parseInt(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="smtp_encryption">Encryption</Label>
                            <Select
                                value={formData.config.encryption || 'tls'}
                                onValueChange={(value) => updateConfig('encryption', value)}
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
                        <div className="space-y-2">
                            <Label htmlFor="smtp_username">Username</Label>
                            <Input
                                id="smtp_username"
                                value={formData.config.username || ''}
                                onChange={(e) => updateConfig('username', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="smtp_password">Password</Label>
                            <Input
                                id="smtp_password"
                                type="password"
                                value={formData.config.password || ''}
                                onChange={(e) => updateConfig('password', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="from_email">From Email</Label>
                            <Input
                                id="from_email"
                                type="email"
                                value={formData.config.from_email || ''}
                                onChange={(e) => updateConfig('from_email', e.target.value)}
                                placeholder="noreply@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="from_name">From Name</Label>
                            <Input
                                id="from_name"
                                value={formData.config.from_name || ''}
                                onChange={(e) => updateConfig('from_name', e.target.value)}
                                placeholder="SpendWise"
                            />
                        </div>
                    </>
                );

            case 'sendgrid':
                return (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="api_key">SendGrid API Key</Label>
                            <Input
                                id="api_key"
                                type="password"
                                value={formData.config.api_key || ''}
                                onChange={(e) => updateConfig('api_key', e.target.value)}
                                placeholder="SG.xxxxxxxxxxxxx"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="from_email">From Email</Label>
                            <Input
                                id="from_email"
                                type="email"
                                value={formData.config.from_email || ''}
                                onChange={(e) => updateConfig('from_email', e.target.value)}
                                placeholder="noreply@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="from_name">From Name</Label>
                            <Input
                                id="from_name"
                                value={formData.config.from_name || ''}
                                onChange={(e) => updateConfig('from_name', e.target.value)}
                                placeholder="SpendWise"
                            />
                        </div>
                    </>
                );

            case 'aws_ses':
                return (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="region">AWS Region</Label>
                            <Input
                                id="region"
                                value={formData.config.region || 'us-east-1'}
                                onChange={(e) => updateConfig('region', e.target.value)}
                                placeholder="us-east-1"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="access_key">Access Key ID</Label>
                            <Input
                                id="access_key"
                                value={formData.config.access_key || ''}
                                onChange={(e) => updateConfig('access_key', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="secret_key">Secret Access Key</Label>
                            <Input
                                id="secret_key"
                                type="password"
                                value={formData.config.secret_key || ''}
                                onChange={(e) => updateConfig('secret_key', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="from_email">From Email</Label>
                            <Input
                                id="from_email"
                                type="email"
                                value={formData.config.from_email || ''}
                                onChange={(e) => updateConfig('from_email', e.target.value)}
                                placeholder="noreply@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="from_name">From Name</Label>
                            <Input
                                id="from_name"
                                value={formData.config.from_name || ''}
                                onChange={(e) => updateConfig('from_name', e.target.value)}
                                placeholder="SpendWise"
                            />
                        </div>
                    </>
                );
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {provider ? 'Edit Email Provider' : 'Add Email Provider'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Provider Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Gmail SMTP"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="driver">Driver</Label>
                        <Select value={formData.driver} onValueChange={handleDriverChange}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="smtp">SMTP</SelectItem>
                                <SelectItem value="sendgrid">SendGrid</SelectItem>
                                <SelectItem value="aws_ses">AWS SES</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {renderDriverConfig()}

                    <div className="space-y-2">
                        <Label htmlFor="priority">Priority (higher = preferred)</Label>
                        <Input
                            id="priority"
                            type="number"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                            min="0"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Optional description"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="is_active"
                                checked={formData.is_active}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, is_active: checked as boolean })
                                }
                            />
                            <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="is_default"
                                checked={formData.is_default}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, is_default: checked as boolean })
                                }
                            />
                            <Label htmlFor="is_default" className="cursor-pointer">Set as Default</Label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {provider ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
