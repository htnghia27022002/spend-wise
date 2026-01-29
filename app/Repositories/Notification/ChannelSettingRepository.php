<?php

declare(strict_types=1);

namespace App\Repositories\Notification;

use App\Models\Notification\NotificationChannelSetting;
use Illuminate\Database\Eloquent\Collection;

final class ChannelSettingRepository
{
    public function findByChannel(string $channel): ?NotificationChannelSetting
    {
        return NotificationChannelSetting::where('channel', $channel)->first();
    }

    public function getAll(): Collection
    {
        return NotificationChannelSetting::orderBy('channel')->get();
    }

    public function getActive(): Collection
    {
        return NotificationChannelSetting::where('is_active', true)->get();
    }

    public function exists(string $channel): bool
    {
        return NotificationChannelSetting::where('channel', $channel)->exists();
    }
}
