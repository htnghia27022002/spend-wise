import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pencil } from 'lucide-react';

interface EmailTemplate {
    id: number;
    name: string;
    slug: string;
    subject: string;
    body: string;
    text_body: string | null;
    variables: string[] | null;
    metadata: Record<string, any> | null;
    is_active: boolean;
    is_default: boolean;
    description: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    templates: EmailTemplate[];
}

export default function Index({ templates }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this template?')) {
            router.delete(`/email/templates/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Email Templates" />

            <div className="mx-auto max-w-7xl flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Email Templates</h1>
                        <p className="text-muted-foreground">Manage email templates with HTML</p>
                    </div>
                    <Link href="/email/templates/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Template
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {templates.map((template) => (
                        <Card key={template.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-lg">{template.name}</CardTitle>
                                            {template.is_default && (
                                                <Badge variant="default">Default</Badge>
                                            )}
                                            {template.is_active ? (
                                                <Badge variant="outline" className="text-green-600 border-green-600">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-gray-400">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Slug: <code className="bg-muted px-1 py-0.5 rounded">{template.slug}</code>
                                        </p>
                                        <p className="text-sm font-medium mt-2">
                                            Subject: {template.subject}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/email/templates/${template.id}/edit`}>
                                            <Button size="sm" variant="outline">
                                                <Pencil className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                        </Link>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDelete(template.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {template.description && (
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {template.description}
                                    </p>
                                )}

                                {template.variables && template.variables.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-sm font-medium mb-2">Variables:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {template.variables.map((variable) => (
                                                <code
                                                    key={variable}
                                                    className="text-xs bg-muted px-2 py-1 rounded"
                                                >
                                                    {'{{' + variable + '}}'}
                                                </code>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 text-xs text-muted-foreground">
                                    Last updated: {new Date(template.updated_at).toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {templates.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <p className="text-muted-foreground mb-4">No email templates created</p>
                            <Link href="/email/templates/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Your First Template
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
