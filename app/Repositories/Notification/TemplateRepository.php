<?php

declare(strict_types=1);

namespace App\Repositories\Notification;

use App\Models\Notification\NotificationTemplate;
use App\Repositories\BaseRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

final class TemplateRepository extends BaseRepository
{
    public function __construct()
    {
        $this->model = new NotificationTemplate();
    }

    /**
     * Get all ordered
     */
    public function getAll(): Collection
    {
        return NotificationTemplate::orderBy('type')->orderBy('channel')->get();
    }

    /**
     * Get paginated
     */
    public function getPaginated(int $perPage = 20): LengthAwarePaginator
    {
        return NotificationTemplate::orderBy('type')->orderBy('channel')->paginate($perPage);
    }

    /**
     * Get by type
     */
    public function getByType(string $type): Collection
    {
        return NotificationTemplate::where('type', $type)->get();
    }

    /**
     * Get by type and channel
     */
    public function getByTypeAndChannel(string $type, string $channel): ?NotificationTemplate
    {
        return NotificationTemplate::where('type', $type)
            ->where('channel', $channel)
            ->where('is_active', true)
            ->where('is_default', true)
            ->first();
    }

    /**
     * Get active templates
     */
    public function getActive(): Collection
    {
        return NotificationTemplate::where('is_active', true)->get();
    }
}
