<?php

declare(strict_types=1);

namespace App\Models\Finance;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Installment extends Model
{
    protected $fillable = [
        'user_id',
        'wallet_id',
        'category_id',
        'name',
        'total_amount',
        'total_installments',
        'amount_per_installment',
        'start_date',
        'due_day',
        'status',
        'description',
        'next_due_date',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'amount_per_installment' => 'decimal:2',
        'start_date' => 'date',
        'next_due_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(InstallmentPayment::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function getRemainingInstallments(): int
    {
        return $this->payments()
            ->whereIn('status', ['unpaid', 'overdue'])
            ->count();
    }
}
