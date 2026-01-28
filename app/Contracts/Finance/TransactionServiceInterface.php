<?php

declare(strict_types=1);

namespace App\Contracts\Finance;

use App\Models\Finance\Transaction;

interface TransactionServiceInterface
{
    public function create(int $userId, array $data): Transaction;

    public function update(Transaction $transaction, array $data): Transaction;

    public function delete(Transaction $transaction): bool;

    public function bulkDelete(array $transactionIds, int $userId): int;
}
