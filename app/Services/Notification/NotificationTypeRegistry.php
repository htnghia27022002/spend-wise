<?php

declare(strict_types=1);

namespace App\Services\Notification;

use Illuminate\Support\Facades\Facade;

/**
 * Notification Type Registry
 * 
 * Central registry for all notification types in the application.
 * Modules can register their notification types here.
 * 
 * @method static void register(string $type, array $config)
 * @method static array get(string $type)
 * @method static array all()
 * @method static bool has(string $type)
 */
class NotificationTypeRegistry extends Facade
{
    private static array $types = [];

    /**
     * Register a notification type
     * 
     * @param string $type Notification type identifier (e.g., 'finance.subscription_due')
     * @param array $config Configuration: ['name' => 'Human Name', 'description' => '...', 'channels' => ['database', 'email'], 'default_enabled' => true]
     */
    public static function register(string $type, array $config): void
    {
        self::$types[$type] = array_merge([
            'name' => $type,
            'description' => '',
            'channels' => ['database'],
            'default_enabled' => true,
            'configurable' => true,
        ], $config);
    }

    /**
     * Get a specific notification type configuration
     */
    public static function get(string $type): ?array
    {
        return self::$types[$type] ?? null;
    }

    /**
     * Get all registered notification types
     */
    public static function all(): array
    {
        return self::$types;
    }

    /**
     * Check if a notification type exists
     */
    public static function has(string $type): bool
    {
        return isset(self::$types[$type]);
    }

    /**
     * Get all types grouped by module
     */
    public static function groupedByModule(): array
    {
        $grouped = [];
        
        foreach (self::$types as $type => $config) {
            $module = explode('.', $type)[0] ?? 'general';
            $grouped[$module][] = array_merge(['type' => $type], $config);
        }

        return $grouped;
    }

    /**
     * Clear all registered types (useful for testing)
     */
    public static function clear(): void
    {
        self::$types = [];
    }
}
