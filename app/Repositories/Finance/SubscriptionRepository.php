<?php

declare(strict_types=1);

namespace App\Repositories\Finance;

use App\Models\Finance\Subscription;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

final class SubscriptionRepository
{
    public function findById(int $id): ?Subscription
    {
        return Subscription::with(['wallet', 'category'])->find($id);
    }

    public function findByIdAndUser(int $id, int $userId): ?Subscription
    {
        return Subscription::where('id', $id)
            ->where('user_id', $userId)
            ->with(['wallet', 'category'])
            ->first();
    }

    public function getPaginatedByUser(int $userId, int $perPage = 50): LengthAwarePaginator
    {
        return Subscription::where('user_id', $userId)
            ->with(['wallet', 'category'])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function getActiveByUser(int $userId): Collection
    {
        return Subscription::where('user_id', $userId)
            ->where('status', 'active')
            ->with(['wallet', 'category'])
            ->orderBy('next_due_date')
            ->get();
    }

    public function getByUserAndStatus(int $userId, string $status, int $perPage = 50): LengthAwarePaginator
    {
        return Subscription::where('user_id', $userId)
            ->where('status', $status)
            ->with(['wallet', 'category'])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function getDueByDate(Carbon $date): Collection
    {
        return Subscription::where('status', 'active')
            ->whereDate('next_due_date', $date->format('Y-m-d'))
            ->with(['wallet', 'category', 'user'])
            ->get();
    }

    public function getUpcomingDue(int $daysAhead = 7): Collection
    {
        return Subscription::where('status', 'active')
            ->whereBetween('next_due_date', [today(), today()->addDays($daysAhead)])
            ->with(['wallet', 'category', 'user'])
            ->orderBy('next_due_date')
            ->get();
    }

    public function getOverdue(): Collection
    {
        return Subscription::where('status', 'active')
            ->where('next_due_date', '<', today())
            ->with(['wallet', 'category', 'user'])
            ->orderBy('next_due_date')
            ->get();
    }

    public function sumByUser(int $userId): float
    {
        return (float) Subscription::where('user_id', $userId)
            ->where('status', 'active')
            ->sum('amount');
    }
}
