import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Wallet } from '@/types/finance';

interface WalletSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  wallets: Wallet[];
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export function WalletSelect({
  value,
  onValueChange,
  wallets,
  label = 'Wallet',
  placeholder = 'Select a wallet',
  error,
  required = false,
}: WalletSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="wallet_id">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {wallets.map((wallet) => (
            <SelectItem key={wallet.id} value={wallet.id.toString()}>
              <div className="flex items-center justify-between gap-2">
                <span>{wallet.name}</span>
                <span className="text-xs text-muted-foreground capitalize">({wallet.type})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
