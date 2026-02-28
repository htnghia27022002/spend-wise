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
        // Example: System Notifications (for future use)
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

        // Example: User Module (for future use)
        // NotificationTypeRegistry::register('user.welcome', [
        //     'name' => 'Welcome Message',
        //     'description' => 'Welcome notification for new users',
        //     'channels' => ['database', 'email'],
        //     'default_enabled' => true,
        //     'configurable' => false,
        // ]);
    }
}
