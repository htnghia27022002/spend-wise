<?php

declare(strict_types=1);

namespace App\Contracts\Calendar;

use App\Models\Calendar\CalendarEvent;
use Illuminate\Pagination\Paginator;

interface CalendarRepositoryInterface
{
    public function getEventsByUserAndMonth(int $userId, string $month): array;

    public function getEventsByUserAndDateRange(int $userId, string $startDate, string $endDate): array;

    public function findById(int $id): ?CalendarEvent;

    public function findByIdAndUser(int $id, int $userId): ?CalendarEvent;

    public function getPaginatedByUser(int $userId, int $perPage = 20): Paginator;
}
