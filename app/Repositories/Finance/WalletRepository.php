<?php

declare(strict_types=1);

namespace App\Repositories\Finance;

use App\Models\Finance\Wallet;
use Illuminate\Database\Eloquent\Collection;

final class WalletRepository
{
    public function findById(int $id): ?Wallet
    {
        return Wallet::find($id);
    }

    public function findByIdAndUser(int $id, int $userId): ?Wallet
    {
        return Wallet::where('id', $id)
            ->where('user_id', $userId)
            ->first();
    }

    public function getAllByUser(int $userId): Collection
    {
        return Wallet::where('user_id', $userId)
            ->orderBy('name')
            ->get();
    }

    public function getActiveByUser(int $userId): Collection
    {
        return Wallet::where('user_id', $userId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
    }

    public function countByUser(int $userId): int
    {
        return Wallet::where('user_id', $userId)->count();
    }
}
