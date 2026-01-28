import { Head, useForm, Link } from '@inertiajs/react';
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
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Wallet {
  id: number;
  name: string;
  type: string;
  balance: number;
  currency: string;
  is_active: boolean;
  description?: string;
}

interface Props {
  wallet: Wallet;
}

export default function Edit({ wallet }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Finance', href: '/finance/dashboard' },
    { title: 'Wallets', href: '/wallets' },
    { title: wallet.name, href: `/wallets/${wallet.id}` },
  ];

  const { data, setData, put, processing, errors } = useForm({
    name: wallet.name,
    type: wallet.type,
    currency: wallet.currency,
    description: wallet.description || '',
    is_active: wallet.is_active,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/wallets/${wallet.id}`);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Wallet" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <Card className="mx-auto w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Edit Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Wallet Name</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
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
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_active"
                  checked={data.is_active}
                  onChange={(e) => setData('is_active', e.target.checked)}
                />
                <Label htmlFor="is_active" className="font-normal cursor-pointer">
                  Active
                </Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={processing}>
                  {processing ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/wallets">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
