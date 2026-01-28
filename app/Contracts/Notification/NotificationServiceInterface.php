<?php

declare(strict_types=1);

namespace App\Contracts\Notification;

interface NotificationServiceInterface
{
    public function sendNotificationsDue(): void;

    public function sendNotificationsOverdue(): void;

    public function notifySubscriptionDue(int $subscriptionId): void;

    public function notifyInstallmentDue(int $paymentId): void;

    public function markAsRead(int $notificationId, int $userId): void;

    public function markAllAsRead(int $userId): void;

    public function updateSettings(int $userId, array $data): void;
}
