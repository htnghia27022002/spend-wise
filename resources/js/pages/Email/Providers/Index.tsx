import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import EmailProviderDialog from './EmailProviderDialog';

interface EmailProvider {
    id: number;
    name: string;
    driver: string;
    config: Record<string, any>;
    is_active: boolean;
    is_default: boolean;
    priority: number;
    last_used_at: string | null;
    description: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    providers: EmailProvider[];
}

export default function Index({ providers }: Props) {
    const [selectedProvider, setSelectedProvider] = useState<EmailProvider | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleCreate = () => {
        setSelectedProvider(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (provider: EmailProvider) => {
        setSelectedProvider(provider);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this provider?')) {
            router.delete(`/email/providers/${id}`);
        }
    };

    const handleSetDefault = (id: number) => {
        router.post(`/email/providers/${id}/set-default`);
    };

    const handleTest = (id: number) => {
        router.post(`/email/providers/${id}/test`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                alert('Test successful!');
            },
            onError: () => {
                alert('Test failed!');
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Email Providers" />

            <div className="mx-auto max-w-7xl flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Email Providers</h1>
                        <p className="text-muted-foreground">Configure email service providers</p>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Provider
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {providers.map((provider) => (
                        <Card key={provider.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{provider.name}</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {provider.driver.toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        {provider.is_default && (
                                            <Badge variant="default">Default</Badge>
                                        )}
                                        {provider.is_active ? (
                                            <Badge variant="outline" className="text-green-600 border-green-600">
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-gray-400">
                                                Inactive
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {provider.description && (
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {provider.description}
                                    </p>
                                )}

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Priority:</span>
                                        <span className="font-medium">{provider.priority}</span>
                                    </div>
                                    {provider.last_used_at && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Last used:</span>
                                            <span className="font-medium">
                                                {new Date(provider.last_used_at).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEdit(provider)}
                                        className="flex-1"
                                    >
                                        Edit
                                    </Button>
                                    {!provider.is_default && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleSetDefault(provider.id)}
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleTest(provider.id)}
                                    >
                                        Test
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDelete(provider.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {providers.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <p className="text-muted-foreground mb-4">No email providers configured</p>
                            <Button onClick={handleCreate}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Your First Provider
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            <EmailProviderDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                provider={selectedProvider}
            />
        </AppLayout>
    );
}
