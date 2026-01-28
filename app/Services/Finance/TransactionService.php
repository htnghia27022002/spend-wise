<?php

declare(strict_types=1);

namespace App\Services\Finance;

use App\Contracts\Finance\TransactionServiceInterface;
use App\Models\Finance\Transaction;
use App\Models\Finance\Wallet;
use App\Repositories\Finance\TransactionRepository;
use App\Repositories\Finance\WalletRepository;
use Illuminate\Support\Facades\DB;

final class TransactionService implements TransactionServiceInterface
{
    public function __construct(
        private readonly TransactionRepository $transactionRepository,
        private readonly WalletRepository $walletRepository,
    ) {}

    public function create(int $userId, array $data): Transaction
    {
        return DB::transaction(function () use ($userId, $data) {
            $data['user_id'] = $userId;
            $transaction = Transaction::create($data);

            $wallet = $this->walletRepository->findById($data['wallet_id']);
            if ($wallet) {
                $amount = $data['type'] === 'income' ? $data['amount'] : -$data['amount'];
                $wallet->updateBalance($amount);
            }

            return $transaction->fresh();
        });
    }

    public function update(Transaction $transaction, array $data): Transaction
    {
        return DB::transaction(function () use ($transaction, $data) {
            $oldAmount = $transaction->amount;
            $oldType = $transaction->type;
            $oldWalletId = $transaction->wallet_id;

            $transaction->update($data);

            // Rollback old wallet balance
            $oldWallet = $this->walletRepository->findById($oldWalletId);
            if ($oldWallet) {
                $rollbackAmount = $oldType === 'income' ? -$oldAmount : $oldAmount;
                $oldWallet->updateBalance($rollbackAmount);
            }

            // Update new wallet balance
            $newWallet = $this->walletRepository->findById($data['wallet_id'] ?? $oldWalletId);
            if ($newWallet) {
                $newAmount = ($data['type'] ?? $oldType) === 'income' 
                    ? ($data['amount'] ?? $oldAmount) 
                    : -($data['amount'] ?? $oldAmount);
                $newWallet->updateBalance($newAmount);
            }

            return $transaction->fresh();
        });
    }

    public function delete(Transaction $transaction): bool
    {
        return DB::transaction(function () use ($transaction) {
            $wallet = $this->walletRepository->findById($transaction->wallet_id);
            if ($wallet) {
                $rollbackAmount = $transaction->type === 'income' ? -$transaction->amount : $transaction->amount;
                $wallet->updateBalance($rollbackAmount);
            }

            return (bool) $transaction->delete();
        });
    }

    public function bulkDelete(array $transactionIds, int $userId): int
    {
        return DB::transaction(function () use ($transactionIds, $userId) {
            $transactions = Transaction::where('user_id', $userId)
                ->whereIn('id', $transactionIds)
                ->get();

            foreach ($transactions as $transaction) {
                $this->delete($transaction);
            }

            return $transactions->count();
        });
    }
}
