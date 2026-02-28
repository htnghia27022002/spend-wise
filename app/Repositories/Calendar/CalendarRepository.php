<?php

declare(strict_types=1);

namespace App\Repositories\Calendar;

use App\Contracts\Calendar\CalendarRepositoryInterface;
use App\Models\Calendar\CalendarEvent;
use App\Repositories\BaseRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

final class CalendarRepository extends BaseRepository implements CalendarRepositoryInterface
{
    public function __construct()
    {
        $this->model = new CalendarEvent();
    }

    /**
     * Get events by user and month
     */
    public function getEventsByUserAndMonth(int $userId, string $month): array
    {
        $startDate = date('Y-m-01', strtotime($month));
        $endDate = date('Y-m-t', strtotime($month));

        return $this->getEventsByUserAndDateRange($userId, $startDate, $endDate);
    }

    /**
     * Get events by user and date range
     */
    public function getEventsByUserAndDateRange(int $userId, string $startDate, string $endDate): array
    {
        return CalendarEvent::where('user_id', $userId)
            ->where('is_active', true)
            ->whereBetween('start_date', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->orderBy('start_date')
            ->with('reminders')
            ->get()
            ->toArray();
    }

    /**
     * Find by ID and user
     */
    public function findByIdAndUser(int $id, int $userId): ?CalendarEvent
    {
        return CalendarEvent::where('id', $id)
            ->where('user_id', $userId)
            ->first();
    }

    /**
     * Get paginated by user
     */
    public function getPaginatedByUser(int $userId, int $perPage = 20): LengthAwarePaginator
    {
        return CalendarEvent::where('user_id', $userId)
            ->where('is_active', true)
            ->orderBy('start_date', 'desc')
            ->with('reminders')
            ->paginate($perPage);
    }
}
