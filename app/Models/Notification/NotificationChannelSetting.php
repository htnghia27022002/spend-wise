<?php

declare(strict_types=1);

namespace App\Models\Notification;

use Illuminate\Database\Eloquent\Model;

final class NotificationChannelSetting extends Model
{
    protected $fillable = [
        'channel',
        'name',
        'description',
        'is_active',
        'configuration',
        'last_tested_at',
        'test_successful',
        'test_error',
    ];

    protected $casts = [
        'configuration' => 'array',
        'is_active' => 'boolean',
        'test_successful' => 'boolean',
        'last_tested_at' => 'datetime',
    ];

    /**
     * Get masked configuration (hide sensitive data)
     */
    public function getMaskedConfiguration(): array
    {
        $config = $this->configuration;
        $sensitiveKeys = ['password', 'auth_token', 'api_key', 'secret'];

        foreach ($sensitiveKeys as $key) {
            if (isset($config[$key]) && $config[$key]) {
                $config[$key] = str_repeat('*', min(strlen($config[$key]), 8));
            }
        }

        return $config;
    }

    /**
     * Check if channel is properly configured
     */
    public function isConfigured(): bool
    {
        return $this->is_active && !empty($this->configuration);
    }
}
