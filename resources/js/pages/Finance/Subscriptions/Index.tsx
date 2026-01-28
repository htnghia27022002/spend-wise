import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

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
          <Button asChild>
            <Link href="/subscriptions/create">
              <Plus className="mr-2 h-4 w-4" />
              New Subscription
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          {subscriptions.data.map((sub) => (
            <Card key={sub.id}>
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
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
