<?php

declare(strict_types=1);

namespace App\Providers;

use App\Services\Notification\NotificationTypeRegistry;
use Illuminate\Support\ServiceProvider;

class NotificationServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->registerNotificationTypes();
    }

    /**
     * Register all notification types from different modules
     */
    protected function registerNotificationTypes(): void
    {
        // System Notifications
        NotificationTypeRegistry::register('system.maintenance', [
            'name' => 'System Maintenance',
            'description' => 'Notification about scheduled system maintenance',
            'channels' => ['database', 'email'],
            'default_enabled' => true,
            'configurable' => false,
        ]);

        NotificationTypeRegistry::register('system.security_alert', [
            'name' => 'Security Alert',
            'description' => 'Important security notifications',
            'channels' => ['database', 'email', 'sms'],
            'default_enabled' => true,
            'configurable' => false,
        ]);

        // Calendar Notifications
        NotificationTypeRegistry::register('calendar.event_reminder', [
            'name' => 'Event Reminder',
            'description' => 'Reminder for upcoming calendar events',
            'channels' => ['database', 'email', 'push'],
            'default_enabled' => true,
            'configurable' => true,
        ]);

        // User Module Notifications
        NotificationTypeRegistry::register('user.welcome', [
            'name' => 'Welcome Message',
            'description' => 'Welcome notification for new users',
            'channels' => ['database', 'email'],
            'default_enabled' => true,
            'configurable' => false,
        ]);
    }
}
