<?php

declare(strict_types=1);

namespace App\Models\Finance;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

final class Transaction extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'wallet_id',
        'category_id',
        'type',
        'amount',
        'description',
        'transaction_date',
        'is_installment',
        'installment_payment_id',
        'subscription_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_installment' => 'boolean',
        'transaction_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
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

    public function installmentPayment(): BelongsTo
    {
        return $this->belongsTo(InstallmentPayment::class, 'installment_payment_id');
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }
}
