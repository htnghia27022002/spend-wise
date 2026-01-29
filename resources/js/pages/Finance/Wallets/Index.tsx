import { Head, Link, router } from '@inertiajs/react';
import { Plus, Trash2, Edit2, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import {
    CardView,
    ListView,
    ViewToggle,
    type ViewMode,
} from '@/components/data-view';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Finance', href: '/finance/dashboard' },
    { title: 'Wallets', href: '/wallets' },
];

interface Wallet {
    id: number;
    name: string;
    type: string;
    balance: number;
    currency: string;
    is_active: boolean;
}

interface Props {
    wallets: Wallet[];
}

export default function Index({ wallets }: Props) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('card');

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure?')) {
            router.delete(`/wallets/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Wallets" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Wallets
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your financial accounts
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <ViewToggle
                            view={viewMode}
                            onViewChange={setViewMode}
                        />
                        <Button asChild>
                            <Link href="/wallets/create">
                                <Plus className="mr-2 h-4 w-4" />
                                New Wallet
                            </Link>
                        </Button>
                    </div>
                </div>

                {viewMode === 'card' ? (
                    <CardView
                        items={wallets}
                        columns={{ default: 1, md: 2, lg: 4 }}
                        renderItem={(wallet) => (
                            <Card className="flex flex-col">
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {wallet.name}
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            setExpandedId(
                                                expandedId === wallet.id
                                                    ? null
                                                    : wallet.id,
                                            )
                                        }
                                    >
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground capitalize">
                                            {wallet.type}
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {formatCurrency(wallet.balance)}
                                        </p>
                                    </div>

                                    {expandedId === wallet.id && (
                                        <div className="space-y-2 border-t pt-4">
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={`/wallets/${wallet.id}/edit`}
                                                >
                                                    <Edit2 className="mr-2 h-4 w-4" />
                                                    Edit
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                className="w-full"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(wallet.id)
                                                }
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    />
                ) : (
                    <ListView
                        items={wallets}
                        renderItem={(wallet) => (
                            <Card>
                                <CardContent className="flex items-center justify-between p-6">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h3 className="font-semibold">
                                                {wallet.name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {wallet.type}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="text-2xl font-bold">
                                            {formatCurrency(wallet.balance)}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={`/wallets/${wallet.id}/edit`}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(wallet.id)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    />
                )}
            </div>
        </AppLayout>
    );
}
