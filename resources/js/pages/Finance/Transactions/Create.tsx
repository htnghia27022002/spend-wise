import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Finance', href: '/finance/dashboard' },
  { title: 'Transactions', href: '/transactions' },
  { title: 'Create', href: '/transactions/create' },
];

interface Wallet {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface Props {
  wallets: Wallet[];
  categories: Category[];
}

export default function Create({ wallets, categories }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    wallet_id: '',
    category_id: '',
    type: 'expense',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/transactions');
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="New Transaction" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <Card className="mx-auto w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Record Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wallet_id">Wallet</Label>
                <Select value={data.wallet_id.toString()} onValueChange={(value) => setData('wallet_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((w) => (
                      <SelectItem key={w.id} value={w.id.toString()}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.wallet_id && <p className="text-sm text-red-500">{errors.wallet_id}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_id">Category</Label>
                <Select value={data.category_id.toString()} onValueChange={(value) => setData('category_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category_id && <p className="text-sm text-red-500">{errors.category_id}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={data.amount}
                  onChange={(e) => setData('amount', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transaction_date">Date</Label>
                <Input
                  id="transaction_date"
                  type="date"
                  value={data.transaction_date}
                  onChange={(e) => setData('transaction_date', e.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={processing}>
                {processing ? 'Recording...' : 'Record Transaction'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
