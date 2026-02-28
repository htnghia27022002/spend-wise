<?php

declare(strict_types=1);

namespace App\Services\Calendar;

use App\Contracts\Calendar\CalendarRepositoryInterface;
use App\Contracts\Calendar\CalendarServiceInterface;
use App\Models\Calendar\CalendarEvent;
use App\Models\Calendar\CalendarReminder;

final class CalendarService implements CalendarServiceInterface
{
    public function __construct(
        private readonly CalendarRepositoryInterface $repository,
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

    public function getCalendarOverview(int $userId, string $startDate, string $endDate): array
    {
        $events = $this->repository->getEventsByUserAndDateRange($userId, $startDate, $endDate);

        $grouped = [
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
            'events_by_type' => $grouped,
        ];
    }
}
