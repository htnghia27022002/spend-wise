<?php

declare(strict_types=1);

namespace App\Services\Finance;

use App\Contracts\Finance\SubscriptionServiceInterface;
use App\Models\Finance\Subscription;
use App\Models\Finance\Transaction;
use App\Repositories\Finance\SubscriptionRepository;
use App\Repositories\Finance\WalletRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

final class SubscriptionService implements SubscriptionServiceInterface
{
    public function __construct(
        private readonly SubscriptionRepository $subscriptionRepository,
        private readonly WalletRepository $walletRepository,
    ) {}

    public function create(int $userId, array $data): Subscription
    {
        $data['user_id'] = $userId;
        $data['next_due_date'] = $this->calculateNextDueDate(new Subscription($data));

        return Subscription::create($data);
    }

    public function update(Subscription $subscription, array $data): Subscription
    {
        $subscription->update($data);

        if (isset($data['start_date']) || isset($data['due_day']) || isset($data['frequency'])) {
            $subscription->update([
                'next_due_date' => $this->calculateNextDueDate($subscription->fresh()),
            ]);
        }

        return $subscription->fresh();
    }

    public function delete(Subscription $subscription): bool
    {
        return (bool) $subscription->delete();
    }

    public function pause(Subscription $subscription): Subscription
    {
        $subscription->update(['status' => 'paused']);

        return $subscription->fresh();
    }

    public function resume(Subscription $subscription): Subscription
    {
        $subscription->update([
            'status' => 'active',
            'next_due_date' => $this->calculateNextDueDate($subscription),
        ]);

        return $subscription->fresh();
    }

    public function calculateNextDueDate(Subscription $subscription): Carbon
    {
        $startDate = Carbon::parse($subscription->start_date);
        $now = now();

        switch ($subscription->frequency) {
            case 'daily':
                $nextDate = $startDate->copy();
                while ($nextDate < $now) {
                    $nextDate->addDay();
                }

                return $nextDate;

            case 'weekly':
                $nextDate = $startDate->copy();
                while ($nextDate < $now) {
                    $nextDate->addWeek();
                }

                return $nextDate;

            case 'monthly':
                $nextDate = $startDate->copy();
                $dueDay = $subscription->due_day ?? $startDate->day;

                while ($nextDate < $now) {
                    $nextDate->addMonth();
                }

                $nextDate->setDay(min($dueDay, $nextDate->daysInMonth()));

                return $nextDate;

            case 'yearly':
                $nextDate = $startDate->copy();
                while ($nextDate < $now) {
                    $nextDate->addYear();
                }

                return $nextDate;

            default:
                return $startDate;
        }
    }

    public function processScheduled(): void
    {
        $subscriptions = $this->subscriptionRepository->getDueByDate(today());

        foreach ($subscriptions as $subscription) {
            $this->processSubscription($subscription);
        }
    }

    private function processSubscription(Subscription $subscription): void
    {
        DB::transaction(function () use ($subscription) {
            // Create transaction
            Transaction::create([
                'user_id' => $subscription->user_id,
                'wallet_id' => $subscription->wallet_id,
                'category_id' => $subscription->category_id,
                'type' => 'expense',
                'amount' => $subscription->amount,
                'description' => "Subscription: {$subscription->name}",
                'transaction_date' => today(),
                'subscription_id' => $subscription->id,
            ]);

            // Update wallet balance
            $wallet = $this->walletRepository->findById($subscription->wallet_id);
            if ($wallet) {
                $wallet->updateBalance(-$subscription->amount);
            }

            // Calculate next due date
            $nextDueDate = $this->calculateNextDueDate($subscription);

            // Check if subscription has ended
            if ($subscription->end_date && $nextDueDate > $subscription->end_date) {
                $subscription->update([
                    'status' => 'ended',
                    'next_due_date' => $nextDueDate,
                ]);
            } else {
                $subscription->update([
                    'next_due_date' => $nextDueDate,
                    'last_transaction_date' => today(),
                ]);
            }
        });
    }
}
