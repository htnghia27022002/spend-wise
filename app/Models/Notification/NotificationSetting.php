<?php

declare(strict_types=1);

namespace App\Models\Notification;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class NotificationSetting extends Model
{
    protected $fillable = [
        'user_id',
        'preferences',
        'enabled_channels',
        'quiet_hours_start',
        'quiet_hours_end',
        'timezone',
    ];

    protected $casts = [
        'preferences' => 'array',
        'enabled_channels' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
