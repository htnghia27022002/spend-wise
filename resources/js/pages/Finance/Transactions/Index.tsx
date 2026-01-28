import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';import AppLayout from '@/layouts/app-layout';
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

export default function Index({ transactions, wallets, filters }: Props) {
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
          <Button asChild>
            <Link href="/transactions/create">
              <Plus className="mr-2 h-4 w-4" />
              New Transaction
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          {transactions.data.map((tx) => (
            <Card key={tx.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <h3 className="font-semibold">{tx.description}</h3>
                  <p className="text-xs text-muted-foreground">
                    {tx.category.name} • {new Date(tx.transaction_date).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <p className={`text-lg font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
