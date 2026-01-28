<?php

declare(strict_types=1);

namespace App\Contracts\Finance;

use App\Models\Finance\Installment;

interface InstallmentServiceInterface
{
    public function create(int $userId, array $data): Installment;

    public function update(Installment $installment, array $data): Installment;

    public function delete(Installment $installment): bool;

    public function markPaymentAsPaid(int $paymentId, array $data): void;

    public function pause(Installment $installment): Installment;

    public function resume(Installment $installment): Installment;

    public function processScheduled(): void;
}
