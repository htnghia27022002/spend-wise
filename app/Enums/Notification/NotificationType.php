<?php

declare(strict_types=1);

namespace App\Enums\Notification;

enum NotificationType: string
{
    case SUBSCRIPTION_DUE = 'subscription_due';
    case SUBSCRIPTION_OVERDUE = 'subscription_overdue';
    case INSTALLMENT_DUE = 'installment_due';
    case INSTALLMENT_OVERDUE = 'installment_overdue';

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
            self::SUBSCRIPTION_DUE => 'Subscription Due',
            self::SUBSCRIPTION_OVERDUE => 'Subscription Overdue',
            self::INSTALLMENT_DUE => 'Installment Due',
            self::INSTALLMENT_OVERDUE => 'Installment Overdue',
        };
    }
}
