import { Head, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { EncoderDecoderForm } from '@/components/tools/encoder-decoder-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Encoder/Decoder',
        href: '/tools/encoder-decoder',
    },
];

export default function EncoderDecoder() {
    const handleEncode = async (input: string, type: string): Promise<string> => {
        const response = await fetch('/tools/encoder-decoder/encode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({ input, type }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Encoding failed');
        }

        const data = await response.json();
        return data.result;
    };

    const handleDecode = async (input: string, type: string): Promise<string> => {
        const response = await fetch('/tools/encoder-decoder/decode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({ input, type }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Decoding failed');
        }

        const data = await response.json();
        return data.result;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Encoder/Decoder" />

            <h1 className="sr-only">Encoder/Decoder Tool</h1>

            <div className="w-full space-y-6 p-4 md:p-6">
                <Heading
                    variant="small"
                    title="Encoder/Decoder Tool"
                    description="Encode and decode text in various formats"
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Convert Text</CardTitle>
                        <CardDescription>
                            Quickly encode or decode text using Base64, Hexadecimal, URL encoding, or JSON
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <EncoderDecoderForm onEncode={handleEncode} onDecode={handleDecode} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
