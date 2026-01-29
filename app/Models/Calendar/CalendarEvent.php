<?php

declare(strict_types=1);

namespace App\Models\Calendar;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class CalendarEvent extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'start_date',
        'end_date',
        'type',
        'color',
        'is_all_day',
        'location',
        'metadata',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_all_day' => 'boolean',
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function reminders(): HasMany
    {
        return $this->hasMany(CalendarReminder::class);
    }
}
