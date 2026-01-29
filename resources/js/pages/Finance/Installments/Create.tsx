import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    
    // Validate required fields
    if (!data.name) {
      alert('Vui lòng nhập tên kế hoạch trả góp');
      return;
    }
    
    if (!data.wallet_id) {
      alert('Vui lòng chọn ví');
      return;
    }
    
    if (!data.category_id) {
      alert('Vui lòng chọn danh mục');
      return;
    }
    
    if (!data.total_amount || Number(data.total_amount) <= 0) {
      alert('Vui lòng nhập tổng số tiền hợp lệ');
      return;
    }
    
    if (!data.total_installments || Number(data.total_installments) < 2) {
      alert('Số kỳ trả góp phải từ 2 trở lên');
      return;
    }
    
    if (!data.first_payment_date) {
      alert('Vui lòng chọn ngày thanh toán đầu tiên');
      return;
    }
    
    post('/installments', {
      onError: (errors) => {
        console.error('Validation errors:', errors);
        const errorMessages = Object.entries(errors)
          .map(([field, messages]) => {
            const fieldName = {
              name: 'Tên kế hoạch',
              wallet_id: 'Ví',
              category_id: 'Danh mục',
              total_amount: 'Tổng số tiền',
              total_installments: 'Số kỳ trả góp',
              first_payment_date: 'Ngày thanh toán đầu tiên',
              start_date: 'Ngày bắt đầu',
              amount_per_installment: 'Số tiền mỗi kỳ',
              payment_frequency: 'Tần suất thanh toán',
            }[field] || field;
            const msg = Array.isArray(messages) ? messages.join(', ') : messages;
            return `${fieldName}: ${msg}`;
          })
          .join('\n');
        alert('Có lỗi xảy ra:\n\n' + errorMessages);
      },
      preserveState: true,
      preserveScroll: true,
    });
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
              {/* Global Error Alert */}
              {Object.keys(errors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-red-800 mb-2">⚠ Có lỗi xảy ra:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {Object.entries(errors).map(([field, messages]) => {
                      const fieldName = {
                        name: 'Tên kế hoạch',
                        wallet_id: 'Ví',
                        category_id: 'Danh mục',
                        total_amount: 'Tổng số tiền',
                        total_installments: 'Số kỳ trả góp',
                        first_payment_date: 'Ngày thanh toán đầu tiên',
                        start_date: 'Ngày bắt đầu',
                        amount_per_installment: 'Số tiền mỗi kỳ',
                        payment_frequency: 'Tần suất thanh toán',
                      }[field] || field;
                      const msg = Array.isArray(messages) ? messages.join(', ') : messages;
                      return (
                        <li key={field} className="text-xs text-red-700">
                          <strong>{fieldName}:</strong> {msg}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Installment Name</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="e.g., iPhone 15 Pro"
                  required
                  className={errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 font-medium flex items-center gap-1">
                    <span>⚠</span> {errors.name}
                  </p>
                )}
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
                    className={errors.total_amount ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.total_amount && (
                    <p className="text-sm text-red-600 font-medium flex items-center gap-1">
                      <span>⚠</span> {errors.total_amount}
                    </p>
                  )}
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
                    className={errors.total_installments ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.total_installments && (
                    <p className="text-sm text-red-600 font-medium flex items-center gap-1">
                      <span>⚠</span> {errors.total_installments}
                    </p>
                  )}
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
                    className={errors.first_payment_date || errors.start_date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  />
                  {(errors.first_payment_date || errors.start_date) && (
                    <p className="text-sm text-red-600 font-medium flex items-center gap-1">
                      <span>⚠</span> {errors.first_payment_date || errors.start_date}
                    </p>
                  )}
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
