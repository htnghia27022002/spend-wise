<?php

declare(strict_types=1);

namespace App\Contracts\Calendar;

use App\Models\Calendar\CalendarEvent;

interface CalendarServiceInterface
{
    public function createEvent(int $userId, array $data): CalendarEvent;

    public function updateEvent(CalendarEvent $event, array $data): CalendarEvent;

    public function deleteEvent(CalendarEvent $event): bool;

    public function createReminder(CalendarEvent $event, int $minutesBefore, string $reminderType): void;

    public function deleteReminder(int $reminderId): bool;

    public function syncPaymentEventsForUser(int $userId): void;

    public function getCalendarOverview(int $userId, string $startDate, string $endDate): array;
}
