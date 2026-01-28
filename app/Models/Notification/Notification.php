<?php

declare(strict_types=1);

namespace App\Models\Notification;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

final class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'channel',
        'title',
        'message',
        'data',
        'action_url',
        'notifiable_type',
        'notifiable_id',
        'read_at',
        'sent',
        'sent_at',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
        'sent_at' => 'datetime',
        'sent' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function notifiable(): MorphTo
    {
        return $this->morphTo();
    }

    public function isRead(): bool
    {
        return $this->read_at !== null;
    }

    public function markAsRead(): void
    {
        $this->update(['read_at' => now()]);
    }
}
