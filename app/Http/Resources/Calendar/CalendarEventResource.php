<?php

declare(strict_types=1);

namespace App\Http\Resources\Calendar;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CalendarEventResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'title' => $this->title,
            'description' => $this->description,
            'start_date' => $this->start_date?->toISOString(),
            'end_date' => $this->end_date?->toISOString(),
            'type' => $this->type,
            'color' => $this->color,
            'is_all_day' => $this->is_all_day,
            'location' => $this->location,
            'metadata' => $this->metadata,
            'is_active' => $this->is_active,
            'reminders' => CalendarReminderResource::collection($this->whenLoaded('reminders')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
