<?php

declare(strict_types=1);

namespace App\Enums\Notification;

enum NotificationChannel: string
{
    case DATABASE = 'database';
    case EMAIL = 'email';
    case SMS = 'sms';
    case PUSH = 'push';

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
            self::DATABASE => 'Database',
            self::EMAIL => 'Email',
            self::SMS => 'SMS',
            self::PUSH => 'Push Notification',
        };
    }
}
