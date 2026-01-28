<?php

declare(strict_types=1);

namespace App\Contracts\Finance;

use App\Models\Finance\Subscription;

interface SubscriptionServiceInterface
{
    public function create(int $userId, array $data): Subscription;

    public function update(Subscription $subscription, array $data): Subscription;

    public function delete(Subscription $subscription): bool;

    public function pause(Subscription $subscription): Subscription;

    public function resume(Subscription $subscription): Subscription;

    public function processScheduled(): void;

    public function calculateNextDueDate(Subscription $subscription): \Carbon\Carbon;
}
