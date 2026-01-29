<?php

declare(strict_types=1);

namespace App\Repositories\Notification;

use App\Models\Notification\Notification;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

final class NotificationRepository
{
    public function findById(int $id): ?Notification
    {
        return Notification::find($id);
    }

    public function getPaginatedByUser(int $userId, int $perPage = 20, ?string $status = null): LengthAwarePaginator
    {
        $query = Notification::where('user_id', $userId);

        if ($status) {
            $query->where('status', $status);
        }

        return $query->orderByDesc('created_at')->paginate($perPage);
    }

    public function getUnreadByUser(int $userId): Collection
    {
        return Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->orderByDesc('created_at')
            ->get();
    }

    public function getByUserAndType(int $userId, string $type): Collection
    {
        return Notification::where('user_id', $userId)
            ->where('type', $type)
            ->orderByDesc('created_at')
            ->get();
    }

    public function countUnreadByUser(int $userId): int
    {
        return Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->count();
    }

    public function getUnsentNotifications(): Collection
    {
        return Notification::where('sent', false)
            ->orderBy('created_at')
            ->get();
    }

    public function getByStatus(string $status): Collection
    {
        return Notification::where('status', $status)
            ->orderByDesc('created_at')
            ->get();
    }

    public function getFailedNotifications(): Collection
    {
        return Notification::where('status', 'failed')
            ->where('retry_count', '<', \DB::raw('max_retries'))
            ->whereNotNull('next_retry_at')
            ->where('next_retry_at', '<=', now())
            ->get();
    }

    public function getPendingNotifications(): Collection
    {
        return Notification::where('status', 'pending')
            ->orderBy('created_at')
            ->get();
    }
}
