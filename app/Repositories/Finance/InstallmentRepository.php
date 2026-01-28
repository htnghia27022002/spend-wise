<?php

declare(strict_types=1);

namespace App\Repositories\Finance;

use App\Models\Finance\Installment;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

final class InstallmentRepository
{
    public function findById(int $id): ?Installment
    {
        return Installment::with(['wallet', 'category', 'payments'])->find($id);
    }

    public function findByIdAndUser(int $id, int $userId): ?Installment
    {
        return Installment::where('id', $id)
            ->where('user_id', $userId)
            ->with(['wallet', 'category', 'payments'])
            ->first();
    }

    public function getPaginatedByUser(int $userId, int $perPage = 50): LengthAwarePaginator
    {
        return Installment::where('user_id', $userId)
            ->with(['wallet', 'category'])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function getActiveByUser(int $userId): Collection
    {
        return Installment::where('user_id', $userId)
            ->where('status', 'active')
            ->with(['wallet', 'category', 'payments'])
            ->orderBy('next_due_date')
            ->get();
    }

    public function getByUserAndStatus(int $userId, string $status, int $perPage = 50): LengthAwarePaginator
    {
        return Installment::where('user_id', $userId)
            ->where('status', $status)
            ->with(['wallet', 'category'])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function getDueByDate(Carbon $date): Collection
    {
        return Installment::where('status', 'active')
            ->whereDate('next_due_date', $date->format('Y-m-d'))
            ->with(['wallet', 'category', 'user', 'payments'])
            ->get();
    }

    public function getUpcomingDue(int $daysAhead = 7): Collection
    {
        return Installment::where('status', 'active')
            ->whereBetween('next_due_date', [today(), today()->addDays($daysAhead)])
            ->with(['wallet', 'category', 'user', 'payments'])
            ->orderBy('next_due_date')
            ->get();
    }

    public function getOverdue(): Collection
    {
        return Installment::where('status', 'active')
            ->where('next_due_date', '<', today())
            ->with(['wallet', 'category', 'user', 'payments'])
            ->orderBy('next_due_date')
            ->get();
    }

    public function sumByUser(int $userId): float
    {
        return (float) Installment::where('user_id', $userId)
            ->where('status', 'active')
            ->sum('total_amount');
    }
}
