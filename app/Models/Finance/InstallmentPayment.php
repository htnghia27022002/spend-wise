<?php

declare(strict_types=1);

namespace App\Models\Finance;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class InstallmentPayment extends Model
{
    protected $fillable = [
        'installment_id',
        'payment_number',
        'amount',
        'due_date',
        'status',
        'paid_date',
        'paid_amount',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'due_date' => 'date',
        'paid_date' => 'date',
        'paid_amount' => 'decimal:2',
    ];

    public function installment(): BelongsTo
    {
        return $this->belongsTo(Installment::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'installment_payment_id');
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    public function isOverdue(): bool
    {
        return $this->status === 'overdue';
    }

    public function markAsOverdue(): void
    {
        if ($this->status === 'unpaid') {
            $this->update(['status' => 'overdue']);
        }
    }
}
