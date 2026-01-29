<?php

declare(strict_types=1);

namespace App\Repositories\Notification;

use App\Models\Notification\NotificationTemplate;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

final class TemplateRepository
{
    public function findById(int $id): ?NotificationTemplate
    {
        return NotificationTemplate::find($id);
    }

    public function getAll(): Collection
    {
        return NotificationTemplate::orderBy('type')->orderBy('channel')->get();
    }

    public function getPaginated(int $perPage = 20): LengthAwarePaginator
    {
        return NotificationTemplate::orderBy('type')->orderBy('channel')->paginate($perPage);
    }

    public function getByType(string $type): Collection
    {
        return NotificationTemplate::where('type', $type)->get();
    }

    public function getByTypeAndChannel(string $type, string $channel): ?NotificationTemplate
    {
        return NotificationTemplate::where('type', $type)
            ->where('channel', $channel)
            ->where('is_active', true)
            ->where('is_default', true)
            ->first();
    }

    public function getActive(): Collection
    {
        return NotificationTemplate::where('is_active', true)->get();
    }
}
