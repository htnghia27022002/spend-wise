<?php

declare(strict_types=1);

namespace App\Services\Notification;

use App\Contracts\Notification\NotificationServiceInterface;
use App\Models\Notification\Notification;
use App\Models\Notification\NotificationSetting;
use App\Repositories\Notification\NotificationRepository;

final class NotificationService implements NotificationServiceInterface
{
    public function __construct(
        private readonly NotificationRepository $notificationRepository,
    ) {}

    public function markAsRead(int $notificationId, int $userId): void
    {
        $notification = Notification::where('id', $notificationId)
            ->where('user_id', $userId)
            ->first();

        if ($notification) {
            $notification->markAsRead();
        }
    }

    public function markAllAsRead(int $userId): void
    {
        Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public function updateSettings(int $userId, array $data): void
    {
        NotificationSetting::updateOrCreate(
            ['user_id' => $userId],
            $data
        );
    }

    public function getAvailableNotificationTypes(): array
    {
        return NotificationTypeRegistry::groupedByModule();
    }

    /**
     * Send notification to user
     * 
     * @param int $userId
     * @param string $type Notification type from registry
     * @param string $title
     * @param string $message
     * @param array $data Additional data
     * @param object|null $notifiable Related model
     */
    public function send(
        int $userId,
        string $type,
        string $title,
        string $message,
        array $data = [],
        ?object $notifiable = null,
        ?string $actionUrl = null
    ): Notification {
        // Check if notification type is registered
        if (!NotificationTypeRegistry::has($type)) {
            throw new \InvalidArgumentException("Notification type '{$type}' is not registered");
        }

        $typeConfig = NotificationTypeRegistry::get($type);
        $user = \App\Models\User::find($userId);
        $settings = $user->notificationSettings;

        // Check if user has this notification type enabled
        if ($settings && isset($settings->preferences[$type]) && !$settings->preferences[$type]) {
            // User disabled this notification type
            throw new \InvalidArgumentException("User disabled notification type '{$type}'");
        }

        // Determine channels to send
        $channels = $settings?->enabled_channels ?? ['database'];

        // Create database notification
        $notification = Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'channel' => 'database',
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'action_url' => $actionUrl,
            'notifiable_type' => $notifiable ? get_class($notifiable) : null,
            'notifiable_id' => $notifiable?->id,
        ]);

        // TODO: Send to other channels (email, sms, push) if enabled
        // This can be handled by events/jobs

        return $notification;
    }
}
