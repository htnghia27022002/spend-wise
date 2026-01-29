import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { CardView, ListView, ViewToggle, type ViewMode } from '@/components/data-view';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Finance', href: '/finance/dashboard' },
  { title: 'Subscriptions', href: '/subscriptions' },
];

interface Subscription {
  id: number;
  name: string;
  amount: number;
  frequency: string;
  status: string;
  next_due_date: string;
}

interface Props {
  subscriptions: {
    data: Subscription[];
  };
  filters: {
    status?: string;
  };
}

export default function Index({ subscriptions, filters }: Props) {
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
      <Head title="Subscriptions" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Recurring Subscriptions</h1>
          <div className="flex gap-2">
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
            <Button asChild>
              <Link href="/subscriptions/create">
                <Plus className="mr-2 h-4 w-4" />
                New Subscription
              </Link>
            </Button>
          </div>
        </div>

        {viewMode === 'card' ? (
          <CardView
            items={subscriptions.data}
            columns={{ default: 1, md: 2, lg: 3 }}
            renderItem={(sub) => (
              <Card>
                <CardContent className="space-y-2 p-6">
                  <h3 className="font-semibold">{sub.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize">
                    {sub.frequency} • Next due: {new Date(sub.next_due_date).toLocaleDateString('vi-VN')}
                  </p>
                  <div>
                    <p className="text-lg font-bold text-red-600">-{formatCurrency(sub.amount)}</p>
                    <p className={`text-xs capitalize ${sub.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                      {sub.status}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          />
        ) : (
          <ListView
            items={subscriptions.data}
            renderItem={(sub) => (
              <Card>
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <h3 className="font-semibold">{sub.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">
                      {sub.frequency} • Next due: {new Date(sub.next_due_date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">-{formatCurrency(sub.amount)}</p>
                    <p className={`text-xs capitalize ${sub.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                      {sub.status}
                    </p>
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
