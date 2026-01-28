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
  { title: 'Wallets', href: '/wallets' },
  { title: 'Create', href: '/wallets/create' },
];

export default function Create() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    type: 'cash',
    balance: '0',
    currency: 'VND',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/wallets');
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Wallet" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <Card className="mx-auto w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Create New Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Wallet Name</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="e.g., Main Bank Account"
                  required
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank">Bank Account</SelectItem>
                      <SelectItem value="ewallet">E-Wallet</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={data.currency}
                    onChange={(e) => setData('currency', e.target.value)}
                    maxLength={3}
                    placeholder="VND"
                  />
                  {errors.currency && <p className="text-sm text-red-500">{errors.currency}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="balance">Initial Balance</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  value={data.balance}
                  onChange={(e) => setData('balance', e.target.value)}
                  placeholder="0"
                  required
                />
                {errors.balance && <p className="text-sm text-red-500">{errors.balance}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="Optional description"
                />
              </div>

              <Button type="submit" disabled={processing}>
                {processing ? 'Creating...' : 'Create Wallet'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
