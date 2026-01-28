import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Transaction } from '@/types/finance';

interface TransactionItemProps {
  transaction: Transaction;
  showWallet?: boolean;
  showCategory?: boolean;
  onClick?: () => void;
}

export function TransactionItem({
  transaction,
  showWallet = true,
  showCategory = true,
  onClick,
}: TransactionItemProps) {
  const isIncome = transaction.type === 'income';

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card
      className={`cursor-pointer transition-colors hover:bg-muted/50 ${onClick ? 'hover:shadow-md' : ''}`}
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className={`rounded-full p-2 ${
            isIncome ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
          }`}
        >
          {isIncome ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">
                {transaction.description || (isIncome ? 'Income' : 'Expense')}
              </h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {showCategory && transaction.category && (
                  <>
                    <Badge variant="outline" className="text-xs">
                      {transaction.category.name}
                    </Badge>
                  </>
                )}
                {showWallet && transaction.wallet && (
                  <span className="capitalize">• {transaction.wallet.name}</span>
                )}
                <span>
                  •{' '}
                  {formatDistanceToNow(new Date(transaction.transaction_date), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </span>
              </div>
            </div>

            <div className={`text-right font-bold ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
              <div>{isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}</div>
              {transaction.is_installment && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  Installment
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
