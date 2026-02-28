<?php

declare(strict_types=1);

namespace App\Repositories\Notification;

use App\Models\Notification\NotificationChannelSetting;
use App\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

final class ChannelSettingRepository extends BaseRepository
{
    public function __construct()
    {
        $this->model = new NotificationChannelSetting();
    }

    /**
     * Find by channel
     */
    public function findByChannel(string $channel): ?NotificationChannelSetting
    {
        return NotificationChannelSetting::where('channel', $channel)->first();
    }

    /**
     * Get all ordered by channel
     */
    public function getAll(): Collection
    {
        return NotificationChannelSetting::orderBy('channel')->get();
    }

    /**
     * Get active channels
     */
    public function getActive(): Collection
    {
        return NotificationChannelSetting::where('is_active', true)->get();
    }

    /**
     * Check if channel exists
     */
    public function channelExists(string $channel): bool
    {
        return NotificationChannelSetting::where('channel', $channel)->exists();
    }
}
