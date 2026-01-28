<?php

declare(strict_types=1);

namespace App\Services\Finance;

use App\Contracts\Finance\WalletServiceInterface;
use App\Models\Finance\Wallet;
use App\Repositories\Finance\WalletRepository;

final class WalletService implements WalletServiceInterface
{
    public function __construct(
        private readonly WalletRepository $repository,
    ) {}

    public function create(int $userId, array $data): Wallet
    {
        $data['user_id'] = $userId;

        return Wallet::create($data);
    }

    public function update(Wallet $wallet, array $data): Wallet
    {
        $wallet->update($data);

        return $wallet->fresh();
    }

    public function delete(Wallet $wallet): bool
    {
        return (bool) $wallet->delete();
    }

    public function updateBalance(Wallet $wallet, float $amount): void
    {
        $wallet->increment('balance', $amount);
    }
}
