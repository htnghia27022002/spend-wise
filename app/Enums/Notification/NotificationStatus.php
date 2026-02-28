<?php

declare(strict_types=1);

namespace App\Enums\Notification;

enum NotificationStatus: string
{
    case PENDING = 'pending';
    case SENDING = 'sending';
    case SENT = 'sent';
    case FAILED = 'failed';
    case CANCELLED = 'cancelled';

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
            self::PENDING => 'Pending',
            self::SENDING => 'Sending',
            self::SENT => 'Sent',
            self::FAILED => 'Failed',
            self::CANCELLED => 'Cancelled',
        };
    }

    /**
     * Get badge color for UI
     */
    public function badgeColor(): string
    {
        return match ($this) {
            self::PENDING => 'yellow',
            self::SENDING => 'blue',
            self::SENT => 'green',
            self::FAILED => 'red',
            self::CANCELLED => 'gray',
        };
    }
}
