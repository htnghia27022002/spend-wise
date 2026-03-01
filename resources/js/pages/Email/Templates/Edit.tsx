import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

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
}

interface Props {
    template: EmailTemplate;
}

export default function Edit({ template }: Props) {
    const [formData, setFormData] = useState({
        name: template.name,
        slug: template.slug,
        subject: template.subject,
        body: template.body,
        text_body: template.text_body || '',
        variables: template.variables || [],
        is_active: template.is_active,
        is_default: template.is_default,
        description: template.description || '',
    });
    const [newVariable, setNewVariable] = useState('');
    const [previewHtml, setPreviewHtml] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.put(`/email/templates/${template.id}`, formData);
    };

    const addVariable = () => {
        if (newVariable && !formData.variables.includes(newVariable)) {
            setFormData({
                ...formData,
                variables: [...formData.variables, newVariable],
            });
            setNewVariable('');
        }
    };

    const removeVariable = (variable: string) => {
        setFormData({
            ...formData,
            variables: formData.variables.filter((v) => v !== variable),
        });
    };

    const insertVariable = (variable: string) => {
        const textarea = document.getElementById('body') as HTMLTextAreaElement;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = formData.body;
            const before = text.substring(0, start);
            const after = text.substring(end);
            const newText = before + '{{' + variable + '}}' + after;

            setFormData({ ...formData, body: newText });

            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + variable.length + 4;
                textarea.focus();
            }, 0);
        }
    };

    const handlePreview = () => {
        let preview = formData.body;
        formData.variables.forEach((variable) => {
            const sampleValue = `Sample ${variable}`;
            preview = preview.replace(new RegExp(`{{${variable}}}`, 'g'), sampleValue);
        });
        setPreviewHtml(preview);
    };

    return (
        <AppLayout>
            <Head title={`Edit Template: ${template.name}`} />

            <div className="mx-auto max-w-7xl flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 lg:p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Edit Email Template</h1>
                    <p className="text-muted-foreground">Update HTML email template</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Template Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Template Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="slug">Slug</Label>
                                        <Input
                                            id="slug"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Email Subject</Label>
                                        <Input
                                            id="subject"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Input
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>HTML Content</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="body">HTML Body</Label>
                                    <textarea
                                        id="body"
                                        value={formData.body}
                                        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                        className="w-full min-h-[400px] p-3 border rounded-md font-mono text-sm"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="text_body">Plain Text Version (Optional)</Label>
                                    <textarea
                                        id="text_body"
                                        value={formData.text_body}
                                        onChange={(e) => setFormData({ ...formData, text_body: e.target.value })}
                                        className="w-full min-h-[150px] p-3 border rounded-md font-mono text-sm"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" onClick={handlePreview}>
                                        Preview HTML
                                    </Button>
                                    <Button type="submit" onClick={handleSubmit}>
                                        Update Template
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {previewHtml && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Preview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div
                                        className="border rounded-md p-4 bg-white"
                                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                                    />
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Variables</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        value={newVariable}
                                        onChange={(e) => setNewVariable(e.target.value)}
                                        placeholder="variable_name"
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVariable())}
                                    />
                                    <Button type="button" onClick={addVariable} size="sm">
                                        Add
                                    </Button>
                                </div>

                                {formData.variables.length > 0 && (
                                    <div className="space-y-2">
                                        {formData.variables.map((variable) => (
                                            <div
                                                key={variable}
                                                className="flex items-center justify-between gap-2 p-2 bg-muted rounded"
                                            >
                                                <code
                                                    className="text-sm cursor-pointer flex-1"
                                                    onClick={() => insertVariable(variable)}
                                                    title="Click to insert"
                                                >
                                                    {'{{' + variable + '}}'}
                                                </code>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeVariable(variable)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
