<?php

declare(strict_types=1);

namespace App\Enums\Calendar;

enum EventType: string
{
    case CUSTOM = 'custom';
    case REMINDER = 'reminder';
    case PAYMENT_DUE = 'payment_due';
    case SUBSCRIPTION_DUE = 'subscription_due';
    case INSTALLMENT_DUE = 'installment_due';

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
            self::CUSTOM => 'Custom Event',
            self::REMINDER => 'Reminder',
            self::PAYMENT_DUE => 'Payment Due',
            self::SUBSCRIPTION_DUE => 'Subscription Due',
            self::INSTALLMENT_DUE => 'Installment Due',
        };
    }
}
