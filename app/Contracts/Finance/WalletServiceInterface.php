<?php

declare(strict_types=1);

namespace App\Contracts\Finance;

use App\Models\Finance\Wallet;

interface WalletServiceInterface
{
    public function create(int $userId, array $data): Wallet;

    public function update(Wallet $wallet, array $data): Wallet;

    public function delete(Wallet $wallet): bool;

    public function updateBalance(Wallet $wallet, float $amount): void;
}
