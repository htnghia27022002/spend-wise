import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Finance', href: '/finance/dashboard' },
  { title: 'Installments', href: '/installments' },
];

interface InstallmentPayment {
  id: number;
  payment_number: number;
  amount: number;
  due_date: string;
  status: string;
}

interface Installment {
  id: number;
  name: string;
  total_amount: number;
  total_installments: number;
  status: string;
  payments: InstallmentPayment[];
}

interface Props {
  installments: {
    data: Installment[];
  };
  filters: {
    status?: string;
  };
}

export default function Index({ installments, filters }: Props) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Installments" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Installment Plans</h1>
          <Button asChild>
            <Link href="/installments/create">
              <Plus className="mr-2 h-4 w-4" />
              New Installment
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          {installments.data.map((inst) => {
            const paidCount = inst.payments.filter((p) => p.status === 'paid').length;

            return (
              <Card key={inst.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{inst.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {paidCount} of {inst.total_installments} payments made
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/installments/${inst.id}`}>View Details</Link>
                    </Button>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(paidCount / inst.total_installments) * 100}%` }}
                    />
                  </div>
                  <p className="text-right text-sm font-semibold mt-2">
                    {formatCurrency(inst.total_amount)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
