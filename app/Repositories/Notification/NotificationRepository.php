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

    public function getPaginatedByUser(int $userId, int $perPage = 20): LengthAwarePaginator
    {
        return Notification::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
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
}
