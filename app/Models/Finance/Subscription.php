<?php

declare(strict_types=1);

namespace App\Models\Finance;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Subscription extends Model
{
    protected $fillable = [
        'user_id',
        'wallet_id',
        'category_id',
        'name',
        'amount',
        'frequency',
        'start_date',
        'end_date',
        'due_day',
        'status',
        'description',
        'next_due_date',
        'last_transaction_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'next_due_date' => 'date',
        'last_transaction_date' => 'date',
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

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
