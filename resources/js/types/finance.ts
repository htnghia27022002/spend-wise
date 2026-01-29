/**
 * Finance Module Type Definitions
 */

export interface Wallet {
  id: number;
  user_id: number;
  name: string;
  type: 'cash' | 'bank' | 'ewallet' | 'credit_card' | 'other';
  balance: number;
  currency: string;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  user_id: number;
  parent_id?: number;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  order: number;
  description?: string;
  created_at: string;
  updated_at: string;
  children?: Category[];
  parent?: Category;
}

export interface Transaction {
  id: number;
  user_id: number;
  wallet_id: number;
  category_id: number;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  transaction_date: string;
  is_installment: boolean;
  installment_payment_id?: number;
  subscription_id?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  wallet?: Wallet;
  category?: Category;
  subscription?: Subscription;
  installment_payment?: InstallmentPayment;
}

export interface Subscription {
  id: number;
  user_id: number;
  wallet_id: number;
  category_id: number;
  name: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  next_due_date: string;
  due_day?: number;
  status: 'active' | 'paused' | 'ended';
  description?: string;
  created_at: string;
  updated_at: string;
  wallet?: Wallet;
  category?: Category;
  transactions?: Transaction[];
}

export interface Installment {
  id: number;
  user_id: number;
  wallet_id: number;
  category_id: number;
  name: string;
  total_amount: number;
  total_installments: number;
  amount_per_installment: number;
  first_payment_date: string;
  payment_frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  status: 'active' | 'paused' | 'completed';
  description?: string;
  created_at: string;
  updated_at: string;
  wallet?: Wallet;
  category?: Category;
  payments?: InstallmentPayment[];
}

export interface InstallmentPayment {
  id: number;
  installment_id: number;
  payment_number: number;
  amount: number;
  due_date: string;
  paid_date?: string;
  paid_amount?: number;
  status: 'unpaid' | 'paid' | 'overdue';
  notes?: string;
  created_at: string;
  updated_at: string;
  installment?: Installment;
  transactions?: Transaction[];
}

export interface Notification {
  id: number;
  user_id: number;
  notifiable_type: string;
  notifiable_id: number;
  type: string;
  channel?: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  action_url?: string;
  read_at?: string;
  sent?: boolean;
  sent_at?: string;
  status?: 'pending' | 'sending' | 'sent' | 'failed';
  retry_count?: number;
  max_retries?: number;
  last_error?: string;
  next_retry_at?: string;
  template_id?: number;
  created_at: string;
  updated_at: string;
  notifiable?: Subscription | Installment;
}

export interface NotificationSetting {
  id: number;
  user_id: number;
  preferences: Record<string, boolean>;
  enabled_channels: string[];
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone?: string;
  created_at: string;
  updated_at: string;
}

// Dashboard Types
export interface DashboardSummary {
  totalBalance: number;
  income: number;
  expense: number;
  difference: number;
}

export interface DashboardComparison {
  incomeChange: number;
  expenseChange: number;
}

export interface ExpenseByCategory {
  id: number;
  name: string;
  color?: string;
  amount: number;
  percentage?: number;
}

export interface DailyData {
  date: string;
  income: number;
  expense: number;
}

export interface DashboardProps {
  summary: DashboardSummary;
  comparison: DashboardComparison;
  expenseByCategory: ExpenseByCategory[];
  recentTransactions: Transaction[];
  dailyData: DailyData[];
  wallets: Wallet[];
  period: string;
}

// Paginated Response
export interface PaginatedData<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// Form Data Types
export interface WalletFormData {
  name: string;
  type: string;
  balance: string | number;
  currency: string;
  description?: string;
  is_active?: boolean;
}

export interface CategoryFormData {
  name: string;
  type: string;
  icon?: string;
  color?: string;
  parent_id?: string | number;
  description?: string;
}

export interface TransactionFormData {
  wallet_id: string | number;
  category_id: string | number;
  type: string;
  amount: string | number;
  description?: string;
  transaction_date: string;
}

export interface SubscriptionFormData {
  name: string;
  wallet_id: string | number;
  category_id: string | number;
  amount: string | number;
  frequency: string;
  start_date: string;
  end_date?: string;
  due_day?: string | number;
  description?: string;
}

export interface InstallmentFormData {
  name: string;
  wallet_id: string | number;
  category_id: string | number;
  total_amount: string | number;
  total_installments: string | number;
  first_payment_date: string;
  payment_frequency: string;
  description?: string;
}
