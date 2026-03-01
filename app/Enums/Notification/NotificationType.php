<?php

declare(strict_types=1);

namespace App\Enums\Notification;

/**
 * Predefined System Notification Types
 * 
 * Note: Notification types are extensible via NotificationTypeRegistry.
 * These are just system defaults. Modules can register additional types.
 */
enum NotificationType: string
{
    case SYSTEM_MAINTENANCE = 'system.maintenance';
    case SYSTEM_SECURITY_ALERT = 'system.security_alert';
    case USER_WELCOME = 'user.welcome';
    case CALENDAR_EVENT_REMINDER = 'calendar.event_reminder';

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
            self::SYSTEM_MAINTENANCE => 'System Maintenance',
            self::SYSTEM_SECURITY_ALERT => 'Security Alert',
            self::USER_WELCOME => 'Welcome Message',
            self::CALENDAR_EVENT_REMINDER => 'Calendar Event Reminder',
        };
    }

    /**
     * Get module name from type
     */
    public function module(): string
    {
        return explode('.', $this->value)[0];
    }
}
