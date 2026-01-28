import { Head, Link } from '@inertiajs/react';
import { Banknote, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Finance',
    href: '/finance/dashboard',
  },
  {
    title: 'Dashboard',
    href: '/finance/dashboard',
  },
];

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  transaction_date: string;
  category: {
    name: string;
    icon?: string;
    color?: string;
  };
  wallet: {
    name: string;
  };
}

interface Wallet {
  id: number;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

interface DailyData {
  date: string;
  income: number;
  expense: number;
}

interface Props {
  summary: {
    totalBalance: number;
    income: number;
    expense: number;
    difference: number;
  };
  comparison: {
    incomeChange: number;
    expenseChange: number;
  };
  expenseByCategory: Array<{
    id: number;
    name: string;
    color?: string;
    amount: number;
  }>;
  recentTransactions: Transaction[];
  dailyData: DailyData[];
  wallets: Wallet[];
  period: string;
}

export default function Dashboard({
  summary,
  comparison,
  expenseByCategory,
  recentTransactions,
  dailyData,
  wallets,
  period,
}: Props) {
  const totalExpense = expenseByCategory.reduce((sum, cat) => sum + cat.amount, 0);

  const categoryPercentages = useMemo(() => {
    if (totalExpense === 0) return [];
    return expenseByCategory.map((cat) => ({
      ...cat,
      percentage: (cat.amount / totalExpense) * 100,
    }));
  }, [expenseByCategory, totalExpense]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Finance Dashboard" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.totalBalance)}</div>
              <p className="text-xs text-muted-foreground">Across all wallets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.income)}
              </div>
              <p
                className={`text-xs ${comparison.incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {comparison.incomeChange >= 0 ? '+' : ''}
                {formatCurrency(comparison.incomeChange)} from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expense</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.expense)}</div>
              <p className={`text-xs ${comparison.expenseChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {comparison.expenseChange >= 0 ? '+' : ''}
                {formatCurrency(comparison.expenseChange)} from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${summary.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {formatCurrency(summary.difference)}
              </div>
              <p className="text-xs text-muted-foreground">Income - Expense</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Expense by Category */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Expense by Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryPercentages.length > 0 ? (
                categoryPercentages.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: category.color || '#999' }}
                        />
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <span className="text-sm font-semibold">{category.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${category.percentage}%`,
                          backgroundColor: category.color || '#999',
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">{formatCurrency(category.amount)}</div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No expenses this period</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Recent Transactions</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/transactions">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0"
                    >
                      <div className="flex flex-col gap-1">
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.category.name} · {transaction.wallet.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.transaction_date).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <p
                        className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No transactions this period</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wallets Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Wallets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {wallets.map((wallet) => (
                <div key={wallet.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{wallet.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{wallet.type}</p>
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <p className="text-lg font-bold">{formatCurrency(wallet.balance)}</p>
                  <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
                    <Link href={`/wallets/${wallet.id}`}>View</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
