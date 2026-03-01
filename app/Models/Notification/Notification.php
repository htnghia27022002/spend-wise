<?php

declare(strict_types=1);

namespace App\Models\Notification;

use App\Enums\Notification\NotificationChannel;
use App\Enums\Notification\NotificationStatus;
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
        'template_id',
        'title',
        'message',
        'data',
        'action_url',
        'notifiable_type',
        'notifiable_id',
        'read_at',
        'sent',
        'sent_at',
        'status',
        'retry_count',
        'max_retries',
        'last_error',
        'next_retry_at',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
        'sent_at' => 'datetime',
        'sent' => 'boolean',
        'next_retry_at' => 'datetime',
        'retry_count' => 'integer',
        'max_retries' => 'integer',
        // Note: 'type' is string to support dynamic types via NotificationTypeRegistry
        'channel' => NotificationChannel::class,
        'status' => NotificationStatus::class,
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

    public function template(): BelongsTo
    {
        return $this->belongsTo(NotificationTemplate::class, 'template_id');
    }

    public function canRetry(): bool
    {
        return $this->status === NotificationStatus::FAILED && $this->retry_count < $this->max_retries;
    }

    public function markAsSending(): void
    {
        $this->update(['status' => NotificationStatus::SENDING]);
    }

    public function markAsSent(): void
    {
        $this->update([
            'status' => 'sent',
            'sent' => true,
            'sent_at' => now(),
        ]);
    }

    public function markAsFailed(string $error): void
    {
        $this->update([
            'status' => 'failed',
            'last_error' => $error,
            'retry_count' => $this->retry_count + 1,
            'next_retry_at' => $this->calculateNextRetry(),
        ]);
    }

    private function calculateNextRetry(): ?\DateTimeInterface
    {
        if ($this->retry_count >= $this->max_retries) {
            return null;
        }

        // Exponential backoff: 5 min, 15 min, 30 min
        $minutes = [5, 15, 30][$this->retry_count] ?? 60;
        return now()->addMinutes($minutes);
    }
}
