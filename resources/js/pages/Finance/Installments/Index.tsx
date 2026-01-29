import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import {
    CardView,
    ListView,
    ViewToggle,
    type ViewMode,
} from '@/components/data-view';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Finance', href: '/finance/dashboard' },
    { title: 'Installments', href: '/installments' },
];

interface InstallmentPayment {
    id: number;
    payment_number: number;
    amount: number;
    due_date: string;
    status: string;
}

interface Installment {
    id: number;
    name: string;
    total_amount: number;
    total_installments: number;
    status: string;
    payments: InstallmentPayment[];
}

interface Props {
    installments: {
        data: Installment[];
    };
    filters: {
        status?: string;
    };
}

export default function Index({ installments }: Props) {
    const [viewMode, setViewMode] = useState<ViewMode>('list');

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Installments" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Installment Plans</h1>
                    <div className="flex gap-2">
                        <ViewToggle
                            view={viewMode}
                            onViewChange={setViewMode}
                        />
                        <Button asChild>
                            <Link href="/installments/create">
                                <Plus className="mr-2 h-4 w-4" />
                                New Installment
                            </Link>
                        </Button>
                    </div>
                </div>

                {viewMode === 'card' ? (
                    <CardView
                        items={installments.data}
                        columns={{ default: 1, md: 2, lg: 3 }}
                        renderItem={(inst) => {
                            const paidCount = inst.payments.filter(
                                (p) => p.status === 'paid',
                            ).length;

                            return (
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="mb-4 space-y-2">
                                            <h3 className="font-semibold">
                                                {inst.name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground">
                                                {paidCount} of{' '}
                                                {inst.total_installments}{' '}
                                                payments made
                                            </p>
                                        </div>
                                        <div className="mb-2 h-2 w-full rounded-full bg-secondary">
                                            <div
                                                className="h-2 rounded-full bg-primary"
                                                style={{
                                                    width: `${(paidCount / inst.total_installments) * 100}%`,
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold">
                                                {formatCurrency(
                                                    inst.total_amount,
                                                )}
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={`/installments/${inst.id}`}
                                                >
                                                    View Details
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        }}
                    />
                ) : (
                    <ListView
                        items={installments.data}
                        renderItem={(inst) => {
                            const paidCount = inst.payments.filter(
                                (p) => p.status === 'paid',
                            ).length;

                            return (
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold">
                                                    {inst.name}
                                                </h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {paidCount} of{' '}
                                                    {inst.total_installments}{' '}
                                                    payments made
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={`/installments/${inst.id}`}
                                                >
                                                    View Details
                                                </Link>
                                            </Button>
                                        </div>
                                        <div className="mb-2 h-2 w-full rounded-full bg-secondary">
                                            <div
                                                className="h-2 rounded-full bg-primary"
                                                style={{
                                                    width: `${(paidCount / inst.total_installments) * 100}%`,
                                                }}
                                            />
                                        </div>
                                        <p className="mt-2 text-right text-sm font-semibold">
                                            {formatCurrency(inst.total_amount)}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        }}
                    />
                )}
            </div>
        </AppLayout>
    );
}
