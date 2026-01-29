<?php

declare(strict_types=1);

namespace App\Services\Calendar;

use App\Contracts\Calendar\CalendarRepositoryInterface;
use App\Contracts\Calendar\CalendarServiceInterface;
use App\Models\Calendar\CalendarEvent;
use App\Models\Calendar\CalendarReminder;
use App\Repositories\Finance\InstallmentRepository;
use App\Repositories\Finance\SubscriptionRepository;

final class CalendarService implements CalendarServiceInterface
{
    public function __construct(
        private readonly CalendarRepositoryInterface $repository,
        private readonly SubscriptionRepository $subscriptionRepository,
        private readonly InstallmentRepository $installmentRepository,
    ) {}

    public function createEvent(int $userId, array $data): CalendarEvent
    {
        $data['user_id'] = $userId;

        return CalendarEvent::create($data);
    }

    public function updateEvent(CalendarEvent $event, array $data): CalendarEvent
    {
        $event->update($data);

        return $event->fresh();
    }

    public function deleteEvent(CalendarEvent $event): bool
    {
        return (bool) $event->delete();
    }

    public function createReminder(CalendarEvent $event, int $minutesBefore, string $reminderType): void
    {
        CalendarReminder::create([
            'calendar_event_id' => $event->id,
            'minutes_before' => $minutesBefore,
            'reminder_type' => $reminderType,
        ]);
    }

    public function deleteReminder(int $reminderId): bool
    {
        $reminder = CalendarReminder::find($reminderId);

        return $reminder ? (bool) $reminder->delete() : false;
    }

    public function syncPaymentEventsForUser(int $userId): void
    {
        // Sync subscription due dates
        $subscriptions = $this->subscriptionRepository->getByUser($userId);
        foreach ($subscriptions as $subscription) {
            $this->createOrUpdateSubscriptionEvent($userId, $subscription);
        }

        // Sync installment payment due dates
        $payments = $this->installmentRepository->getByUser($userId);
        foreach ($payments as $payment) {
            $this->createOrUpdateInstallmentEvent($userId, $payment);
        }
    }

    public function getCalendarOverview(int $userId, string $startDate, string $endDate): array
    {
        $events = $this->repository->getEventsByUserAndDateRange($userId, $startDate, $endDate);

        $grouped = [
            'payment_due' => [],
            'subscription_due' => [],
            'installment_due' => [],
            'custom' => [],
            'reminder' => [],
        ];

        foreach ($events as $event) {
            $type = $event['type'];
            if (isset($grouped[$type])) {
                $grouped[$type][] = $event;
            }
        }

        return [
            'total_events' => count($events),
            'upcoming_payments' => count($grouped['payment_due']),
            'upcoming_subscriptions' => count($grouped['subscription_due']),
            'upcoming_installments' => count($grouped['installment_due']),
            'events_by_type' => $grouped,
        ];
    }

    private function createOrUpdateSubscriptionEvent(int $userId, $subscription): void
    {
        $eventData = [
            'user_id' => $userId,
            'title' => "Subscription: {$subscription['name']}",
            'description' => $subscription['description'] ?? null,
            'start_date' => $subscription['next_billing_date'],
            'type' => 'subscription_due',
            'color' => 'blue',
            'is_all_day' => true,
            'metadata' => [
                'linkedId' => $subscription['id'],
                'linkedType' => 'subscription',
                'amount' => $subscription['amount'],
            ],
        ];

        CalendarEvent::updateOrCreate(
            [
                'user_id' => $userId,
                'metadata->linkedId' => $subscription['id'],
                'metadata->linkedType' => 'subscription',
            ],
            $eventData
        );
    }

    private function createOrUpdateInstallmentEvent(int $userId, $payment): void
    {
        $eventData = [
            'user_id' => $userId,
            'title' => "Installment Payment Due",
            'start_date' => $payment['due_date'],
            'type' => 'installment_due',
            'color' => $payment['status'] === 'overdue' ? 'red' : 'yellow',
            'is_all_day' => true,
            'metadata' => [
                'linkedId' => $payment['id'],
                'linkedType' => 'installment_payment',
                'amount' => $payment['amount'],
                'status' => $payment['status'],
            ],
        ];

        CalendarEvent::updateOrCreate(
            [
                'user_id' => $userId,
                'metadata->linkedId' => $payment['id'],
                'metadata->linkedType' => 'installment_payment',
            ],
            $eventData
        );
    }
}
