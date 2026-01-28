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
  { title: 'Installments', href: '/installments' },
  { title: 'Create', href: '/installments/create' },
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
    name: '',
    wallet_id: '',
    category_id: '',
    total_amount: '',
    total_installments: '',
    first_payment_date: new Date().toISOString().split('T')[0],
    payment_frequency: 'monthly',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/installments');
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="New Installment Plan" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <Card className="mx-auto w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Create Installment Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Installment Name</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="e.g., iPhone 15 Pro"
                  required
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="total_amount">Total Amount</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    step="0.01"
                    value={data.total_amount}
                    onChange={(e) => setData('total_amount', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                  {errors.total_amount && <p className="text-sm text-red-500">{errors.total_amount}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total_installments">Number of Installments</Label>
                  <Input
                    id="total_installments"
                    type="number"
                    min="2"
                    value={data.total_installments}
                    onChange={(e) => setData('total_installments', e.target.value)}
                    placeholder="12"
                    required
                  />
                  {errors.total_installments && <p className="text-sm text-red-500">{errors.total_installments}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_payment_date">First Payment Date</Label>
                  <Input
                    id="first_payment_date"
                    type="date"
                    value={data.first_payment_date}
                    onChange={(e) => setData('first_payment_date', e.target.value)}
                    required
                  />
                  {errors.first_payment_date && <p className="text-sm text-red-500">{errors.first_payment_date}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_frequency">Payment Frequency</Label>
                  <Select value={data.payment_frequency} onValueChange={(value) => setData('payment_frequency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.payment_frequency && <p className="text-sm text-red-500">{errors.payment_frequency}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="Additional notes..."
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>

              {data.total_amount && data.total_installments && (
                <div className="rounded-lg border bg-muted p-4">
                  <p className="text-sm text-muted-foreground">
                    Amount per installment:{' '}
                    <span className="font-semibold text-foreground">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        minimumFractionDigits: 0,
                      }).format(Number(data.total_amount) / Number(data.total_installments))}
                    </span>
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={processing}>
                  {processing ? 'Creating...' : 'Create Installment Plan'}
                </Button>
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
