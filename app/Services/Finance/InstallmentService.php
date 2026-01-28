<?php

declare(strict_types=1);

namespace App\Services\Finance;

use App\Contracts\Finance\InstallmentServiceInterface;
use App\Models\Finance\Installment;
use App\Models\Finance\InstallmentPayment;
use App\Models\Finance\Transaction;
use App\Repositories\Finance\InstallmentRepository;
use App\Repositories\Finance\WalletRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

final class InstallmentService implements InstallmentServiceInterface
{
    public function __construct(
        private readonly InstallmentRepository $installmentRepository,
        private readonly WalletRepository $walletRepository,
    ) {}

    public function create(int $userId, array $data): Installment
    {
        return DB::transaction(function () use ($userId, $data) {
            $data['user_id'] = $userId;

            $startDate = Carbon::parse($data['start_date']);
            $dueDay = $data['due_day'] ?? $startDate->day;

            // Calculate next due date
            $nextDueDate = $this->calculateNextDueDate($startDate, $dueDay);

            $data['next_due_date'] = $nextDueDate;

            $installment = Installment::create($data);

            // Create payment schedule
            $this->createPaymentSchedule($installment, $startDate, $dueDay);

            return $installment->fresh(['payments']);
        });
    }

    public function update(Installment $installment, array $data): Installment
    {
        return DB::transaction(function () use ($installment, $data) {
            $installment->update($data);

            if (isset($data['start_date']) || isset($data['due_day'])) {
                $startDate = Carbon::parse($data['start_date'] ?? $installment->start_date);
                $dueDay = $data['due_day'] ?? $installment->due_day;

                $installment->update([
                    'next_due_date' => $this->calculateNextDueDate($startDate, $dueDay),
                ]);

                // Regenerate payment schedule if needed
                $installment->payments()->delete();
                $this->createPaymentSchedule($installment, $startDate, $dueDay);
            }

            return $installment->fresh(['payments']);
        });
    }

    public function delete(Installment $installment): bool
    {
        return DB::transaction(function () use ($installment) {
            $installment->payments()->delete();

            return (bool) $installment->delete();
        });
    }

    public function markPaymentAsPaid(int $paymentId, array $data): void
    {
        DB::transaction(function () use ($paymentId, $data) {
            $payment = InstallmentPayment::find($paymentId);

            if (! $payment) {
                return;
            }

            $payment->update([
                'status' => 'paid',
                'paid_date' => $data['paid_date'] ?? today(),
                'paid_amount' => $data['paid_amount'] ?? $payment->amount,
                'notes' => $data['notes'] ?? null,
            ]);

            // Create transaction if not exists
            if ($payment->transactions()->count() === 0) {
                Transaction::create([
                    'user_id' => $payment->installment->user_id,
                    'wallet_id' => $payment->installment->wallet_id,
                    'category_id' => $payment->installment->category_id,
                    'type' => 'expense',
                    'amount' => $payment->paid_amount ?? $payment->amount,
                    'description' => "Installment payment: {$payment->installment->name} (Payment {$payment->payment_number})",
                    'transaction_date' => $data['paid_date'] ?? today(),
                    'is_installment' => true,
                    'installment_payment_id' => $payment->id,
                ]);
            }

            // Update wallet
            $wallet = $this->walletRepository->findById($payment->installment->wallet_id);
            if ($wallet) {
                $wallet->updateBalance(-($payment->paid_amount ?? $payment->amount));
            }

            // Check if all payments are paid
            $installment = $payment->installment;
            $unpaidCount = $installment->payments()
                ->whereIn('status', ['unpaid', 'overdue'])
                ->count();

            if ($unpaidCount === 0) {
                $installment->update(['status' => 'completed']);
            }
        });
    }

    public function pause(Installment $installment): Installment
    {
        $installment->update(['status' => 'paused']);

        return $installment->fresh();
    }

    public function resume(Installment $installment): Installment
    {
        $startDate = Carbon::parse($installment->start_date);
        $dueDay = $installment->due_day ?? $startDate->day;

        $installment->update([
            'status' => 'active',
            'next_due_date' => $this->calculateNextDueDate($startDate, $dueDay),
        ]);

        return $installment->fresh();
    }

    public function processScheduled(): void
    {
        $installments = $this->installmentRepository->getDueByDate(today());

        foreach ($installments as $installment) {
            $this->updateInstallmentPaymentStatus($installment);
        }
    }

    private function createPaymentSchedule(Installment $installment, Carbon $startDate, int $dueDay): void
    {
        $currentDate = $startDate->copy();

        for ($i = 1; $i <= $installment->total_installments; $i++) {
            $paymentDate = $currentDate->copy();

            // Set due day for this month
            $paymentDate->setDay(min($dueDay, $paymentDate->daysInMonth()));

            // Ensure payment date is not in the past
            if ($paymentDate < $startDate) {
                $paymentDate->addMonth();
                $paymentDate->setDay(min($dueDay, $paymentDate->daysInMonth()));
            }

            InstallmentPayment::create([
                'installment_id' => $installment->id,
                'payment_number' => $i,
                'amount' => $installment->amount_per_installment,
                'due_date' => $paymentDate,
            ]);

            $currentDate->addMonth();
        }
    }

    private function calculateNextDueDate(Carbon $startDate, int $dueDay): Carbon
    {
        $nextDate = $startDate->copy();
        $nextDate->setDay(min($dueDay, $nextDate->daysInMonth()));

        if ($nextDate < now()) {
            $nextDate->addMonth();
            $nextDate->setDay(min($dueDay, $nextDate->daysInMonth()));
        }

        return $nextDate;
    }

    private function updateInstallmentPaymentStatus(Installment $installment): void
    {
        $installment->payments()
            ->where('status', 'unpaid')
            ->where('due_date', '<', today())
            ->update(['status' => 'overdue']);
    }
}
