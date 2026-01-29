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
    { title: 'Transactions', href: '/transactions' },
];
interface Transaction {
    id: number;
    type: 'income' | 'expense';
    amount: number;
    description: string;
    transaction_date: string;
    category: {
        name: string;
    };
}

interface Wallet {
    id: number;
    name: string;
}

interface Props {
    transactions: {
        data: Transaction[];
        links: {
            next?: string;
            prev?: string;
        };
    };
    wallets: Wallet[];
    filters: {
        type?: string;
        category_id?: number;
        wallet_id?: number;
    };
}

export default function Index({ transactions }: Props) {
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
            <Head title="Transactions" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Transactions</h1>
                    <div className="flex gap-2">
                        <ViewToggle
                            view={viewMode}
                            onViewChange={setViewMode}
                        />
                        <Button asChild>
                            <Link href="/transactions/create">
                                <Plus className="mr-2 h-4 w-4" />
                                New Transaction
                            </Link>
                        </Button>
                    </div>
                </div>

                {viewMode === 'card' ? (
                    <CardView
                        items={transactions.data}
                        columns={{ default: 1, md: 2, lg: 3 }}
                        renderItem={(tx) => (
                            <Card>
                                <CardContent className="space-y-2 p-6">
                                    <h3 className="font-semibold">
                                        {tx.description}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        {tx.category.name} •{' '}
                                        {new Date(
                                            tx.transaction_date,
                                        ).toLocaleDateString('vi-VN')}
                                    </p>
                                    <p
                                        className={`text-lg font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
                                    >
                                        {tx.type === 'income' ? '+' : '-'}
                                        {formatCurrency(tx.amount)}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    />
                ) : (
                    <ListView
                        items={transactions.data}
                        renderItem={(tx) => (
                            <Card>
                                <CardContent className="flex items-center justify-between p-6">
                                    <div>
                                        <h3 className="font-semibold">
                                            {tx.description}
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            {tx.category.name} •{' '}
                                            {new Date(
                                                tx.transaction_date,
                                            ).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                    <p
                                        className={`text-lg font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
                                    >
                                        {tx.type === 'income' ? '+' : '-'}
                                        {formatCurrency(tx.amount)}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    />
                )}
            </div>
        </AppLayout>
    );
}
