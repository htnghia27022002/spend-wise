<?php

declare(strict_types=1);

namespace App\Services\Notification;

use App\Models\Notification\NotificationChannelSetting;
use App\Repositories\Notification\ChannelSettingRepository;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

final class ChannelSettingService
{
    public function __construct(
        private readonly ChannelSettingRepository $repository,
    ) {}

    public function createOrUpdate(string $channel, array $data): NotificationChannelSetting
    {
        return NotificationChannelSetting::updateOrCreate(
            ['channel' => $channel],
            [
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'is_active' => $data['is_active'] ?? false,
                'configuration' => $data['configuration'] ?? [],
            ]
        );
    }

    public function activate(string $channel): bool
    {
        $setting = $this->repository->findByChannel($channel);
        if (!$setting) {
            return false;
        }

        $setting->update(['is_active' => true]);
        return true;
    }

    public function deactivate(string $channel): bool
    {
        $setting = $this->repository->findByChannel($channel);
        if (!$setting) {
            return false;
        }

        $setting->update(['is_active' => false]);
        return true;
    }

    public function testConnection(string $channel): array
    {
        $setting = $this->repository->findByChannel($channel);
        
        if (!$setting) {
            return [
                'success' => false,
                'message' => 'Channel setting not found',
            ];
        }

        try {
            $result = match ($channel) {
                'email' => $this->testEmailConnection($setting),
                'sms' => $this->testSmsConnection($setting),
                'push' => $this->testPushConnection($setting),
                default => ['success' => false, 'message' => 'Unsupported channel'],
            };

            $setting->update([
                'last_tested_at' => now(),
                'test_successful' => $result['success'],
                'test_error' => $result['success'] ? null : $result['message'],
            ]);

            return $result;
        } catch (\Exception $e) {
            Log::error("Channel test failed for {$channel}", [
                'error' => $e->getMessage(),
            ]);

            $setting->update([
                'last_tested_at' => now(),
                'test_successful' => false,
                'test_error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    private function testEmailConnection(NotificationChannelSetting $setting): array
    {
        $config = $setting->configuration;

        // Validate required fields
        $required = ['host', 'port', 'username', 'password', 'from_address'];
        foreach ($required as $field) {
            if (empty($config[$field])) {
                return [
                    'success' => false,
                    'message' => "Missing required field: {$field}",
                ];
            }
        }

        // Configure mail transport temporarily
        config([
            'mail.mailers.test_smtp' => [
                'transport' => 'smtp',
                'host' => $config['host'],
                'port' => $config['port'],
                'username' => $config['username'],
                'password' => $config['password'],
                'encryption' => $config['encryption'] ?? 'tls',
            ],
        ]);

        // Try to send a test email
        try {
            Mail::mailer('test_smtp')->raw('Test email from SpendWise', function ($message) use ($config) {
                $message->to($config['username'])
                    ->from($config['from_address'], $config['from_name'] ?? 'SpendWise')
                    ->subject('Test Email - SpendWise Notification System');
            });

            return [
                'success' => true,
                'message' => 'SMTP connection successful. Test email sent.',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => "SMTP connection failed: {$e->getMessage()}",
            ];
        }
    }

    private function testSmsConnection(NotificationChannelSetting $setting): array
    {
        $config = $setting->configuration;

        // Validate required fields
        $required = ['provider', 'account_sid', 'auth_token', 'from_number'];
        foreach ($required as $field) {
            if (empty($config[$field])) {
                return [
                    'success' => false,
                    'message' => "Missing required field: {$field}",
                ];
            }
        }

        // For now, just validate configuration exists
        // In production, you would integrate with Twilio or other SMS providers
        return [
            'success' => true,
            'message' => 'SMS configuration validated. (Note: Actual SMS sending not implemented in test mode)',
        ];
    }

    private function testPushConnection(NotificationChannelSetting $setting): array
    {
        $config = $setting->configuration;

        // Validate required fields
        $required = ['provider', 'api_key'];
        foreach ($required as $field) {
            if (empty($config[$field])) {
                return [
                    'success' => false,
                    'message' => "Missing required field: {$field}",
                ];
            }
        }

        // For now, just validate configuration exists
        return [
            'success' => true,
            'message' => 'Push notification configuration validated. (Note: Actual push sending not implemented in test mode)',
        ];
    }

    public function delete(string $channel): bool
    {
        $setting = $this->repository->findByChannel($channel);
        
        if (!$setting) {
            return false;
        }

        return $setting->delete();
    }
}
