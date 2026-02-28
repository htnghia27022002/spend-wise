<?php

declare(strict_types=1);

namespace App\Enums\Calendar;

enum ReminderType: string
{
    case NOTIFICATION = 'notification';
    case EMAIL = 'email';
    case SMS = 'sms';

    /**
     * Get all values
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Get label for display
     */
    public function label(): string
    {
        return match ($this) {
            self::NOTIFICATION => 'In-App Notification',
            self::EMAIL => 'Email',
            self::SMS => 'SMS',
        };
    }
}
