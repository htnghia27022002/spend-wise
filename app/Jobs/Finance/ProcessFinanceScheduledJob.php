<?php

declare(strict_types=1);

namespace App\Jobs\Finance;

use App\Contracts\Finance\InstallmentServiceInterface;
use App\Contracts\Notification\NotificationServiceInterface;
use App\Contracts\Finance\SubscriptionServiceInterface;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

final class ProcessFinanceScheduledJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(
        SubscriptionServiceInterface $subscriptionService,
        InstallmentServiceInterface $installmentService,
        NotificationServiceInterface $notificationService,
    ): void {
        // Process scheduled subscriptions
        $subscriptionService->processScheduled();

        // Process scheduled installments
        $installmentService->processScheduled();

        // Send notifications for due items
        $notificationService->sendNotificationsDue();

        // Send notifications for overdue items
        $notificationService->sendNotificationsOverdue();
    }
}
