<?php

declare(strict_types=1);

namespace App\Repositories\Finance;

use App\Models\Finance\Transaction;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

final class TransactionRepository
{
    public function findById(int $id): ?Transaction
    {
        return Transaction::with(['wallet', 'category'])->find($id);
    }

    public function findByIdAndUser(int $id, int $userId): ?Transaction
    {
        return Transaction::where('id', $id)
            ->where('user_id', $userId)
            ->with(['wallet', 'category'])
            ->first();
    }

    public function getPaginatedByUser(int $userId, int $perPage = 50): LengthAwarePaginator
    {
        return Transaction::where('user_id', $userId)
            ->with(['wallet', 'category'])
            ->orderByDesc('transaction_date')
            ->paginate($perPage);
    }

    public function getByUserAndDate(int $userId, Carbon $date): Collection
    {
        return Transaction::where('user_id', $userId)
            ->whereDate('transaction_date', $date->format('Y-m-d'))
            ->with(['wallet', 'category'])
            ->get();
    }

    public function getByUserAndDateRange(int $userId, Carbon $startDate, Carbon $endDate): Collection
    {
        return Transaction::where('user_id', $userId)
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->with(['wallet', 'category'])
            ->orderByDesc('transaction_date')
            ->get();
    }

    public function getByUserAndType(int $userId, string $type, int $perPage = 50): LengthAwarePaginator
    {
        return Transaction::where('user_id', $userId)
            ->where('type', $type)
            ->with(['wallet', 'category'])
            ->orderByDesc('transaction_date')
            ->paginate($perPage);
    }

    public function getByUserAndCategory(int $userId, int $categoryId, int $perPage = 50): LengthAwarePaginator
    {
        return Transaction::where('user_id', $userId)
            ->where('category_id', $categoryId)
            ->with(['wallet', 'category'])
            ->orderByDesc('transaction_date')
            ->paginate($perPage);
    }

    public function getByUserAndWallet(int $userId, int $walletId, int $perPage = 50): LengthAwarePaginator
    {
        return Transaction::where('user_id', $userId)
            ->where('wallet_id', $walletId)
            ->with(['wallet', 'category'])
            ->orderByDesc('transaction_date')
            ->paginate($perPage);
    }

    public function sumByUserAndType(int $userId, string $type, ?Carbon $startDate = null, ?Carbon $endDate = null): float
    {
        $query = Transaction::where('user_id', $userId)
            ->where('type', $type);

        if ($startDate && $endDate) {
            $query->whereBetween('transaction_date', [$startDate, $endDate]);
        }

        return (float) $query->sum('amount');
    }

    public function sumByUserAndCategory(int $userId, int $categoryId, ?Carbon $startDate = null, ?Carbon $endDate = null): float
    {
        $query = Transaction::where('user_id', $userId)
            ->where('category_id', $categoryId);

        if ($startDate && $endDate) {
            $query->whereBetween('transaction_date', [$startDate, $endDate]);
        }

        return (float) $query->sum('amount');
    }
}
