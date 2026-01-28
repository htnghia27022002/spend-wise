<?php

declare(strict_types=1);

namespace App\Services\Notification;

use App\Contracts\Notification\NotificationServiceInterface;
use App\Models\Notification\Notification;
use App\Models\Notification\NotificationSetting;
use App\Repositories\Finance\InstallmentRepository;
use App\Repositories\Notification\NotificationRepository;
use App\Repositories\Finance\SubscriptionRepository;

final class NotificationService implements NotificationServiceInterface
{
    public function __construct(
        private readonly NotificationRepository $notificationRepository,
        private readonly SubscriptionRepository $subscriptionRepository,
        private readonly InstallmentRepository $installmentRepository,
    ) {}

    public function sendNotificationsDue(): void
    {
        // Get subscriptions and installments due soon
        $subscriptions = $this->subscriptionRepository->getUpcomingDue();
        $installments = $this->installmentRepository->getUpcomingDue();

        foreach ($subscriptions as $subscription) {
            $this->notifySubscriptionDue($subscription->id);
        }

        foreach ($installments as $installment) {
            foreach ($installment->payments()->where('status', 'unpaid')->get() as $payment) {
                $this->notifyInstallmentDue($payment->id);
            }
        }
    }

    public function sendNotificationsOverdue(): void
    {
        // Get overdue subscriptions and installments
        $subscriptions = $this->subscriptionRepository->getOverdue();
        $installments = $this->installmentRepository->getOverdue();

        foreach ($subscriptions as $subscription) {
            $this->send(
                userId: $subscription->user_id,
                type: 'finance.subscription_overdue',
                title: "Subscription Overdue: {$subscription->name}",
                message: "Your subscription \"{$subscription->name}\" is overdue. Amount: " . number_format($subscription->amount, 0) . ' VND',
                data: [
                    'subscription_id' => $subscription->id,
                    'amount' => $subscription->amount,
                ],
                notifiable: $subscription,
                actionUrl: route('subscriptions.show', $subscription->id)
            );
        }

        foreach ($installments as $installment) {
            $this->send(
                userId: $installment->user_id,
                type: 'finance.installment_overdue',
                title: "Installment Overdue: {$installment->name}",
                message: "Your installment \"{$installment->name}\" has overdue payments.",
                data: [
                    'installment_id' => $installment->id,
                ],
                notifiable: $installment,
                actionUrl: route('installments.show', $installment->id)
            );
        }
    }

    public function notifySubscriptionDue(int $subscriptionId): void
    {
        $subscription = $this->subscriptionRepository->findById($subscriptionId);

        if (! $subscription) {
            return;
        }

        $this->send(
            userId: $subscription->user_id,
            type: 'finance.subscription_due',
            title: "Subscription Due: {$subscription->name}",
            message: "Your subscription \"{$subscription->name}\" is due on {$subscription->next_due_date->format('d/m/Y')}. Amount: " . number_format($subscription->amount, 0) . ' VND',
            data: [
                'subscription_id' => $subscription->id,
                'amount' => $subscription->amount,
                'due_date' => $subscription->next_due_date->toDateString(),
            ],
            notifiable: $subscription,
            actionUrl: route('subscriptions.show', $subscription->id)
        );
    }

    public function notifyInstallmentDue(int $paymentId): void
    {
        $payment = \App\Models\Finance\InstallmentPayment::find($paymentId);

        if (! $payment) {
            return;
        }

        $this->send(
            userId: $payment->installment->user_id,
            type: 'finance.installment_due',
            title: "Installment Due: {$payment->installment->name}",
            message: "Payment {$payment->payment_number} of {$payment->installment->name} is due on {$payment->due_date->format('d/m/Y')}. Amount: " . number_format($payment->amount, 0) . ' VND',
            data: [
                'installment_id' => $payment->installment->id,
                'payment_number' => $payment->payment_number,
                'amount' => $payment->amount,
                'due_date' => $payment->due_date->toDateString(),
            ],
            notifiable: $payment,
            actionUrl: route('installments.show', $payment->installment->id)
        );
    }

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
            return null;
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
