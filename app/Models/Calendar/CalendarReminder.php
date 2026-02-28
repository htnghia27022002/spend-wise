<?php

declare(strict_types=1);

namespace App\Models\Calendar;

use App\Enums\Calendar\ReminderType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class CalendarReminder extends Model
{
    protected $fillable = [
        'calendar_event_id',
        'minutes_before',
        'reminder_type',
        'is_sent',
        'sent_at',
        'is_active',
    ];

    protected $casts = [
        'minutes_before' => 'integer',
        'is_sent' => 'boolean',
        'is_active' => 'boolean',
        'sent_at' => 'datetime',
        'reminder_type' => ReminderType::class,
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(CalendarEvent::class, 'calendar_event_id');
    }
}
