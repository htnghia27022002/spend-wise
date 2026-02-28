<?php

declare(strict_types=1);

namespace App\Http\Resources\Notification;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
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
            'type' => $this->type,
            'channel' => $this->channel,
            'template_id' => $this->template_id,
            'title' => $this->title,
            'message' => $this->message,
            'data' => $this->data,
            'action_url' => $this->action_url,
            'notifiable_type' => $this->notifiable_type,
            'notifiable_id' => $this->notifiable_id,
            'read_at' => $this->read_at?->toISOString(),
            'sent' => $this->sent,
            'sent_at' => $this->sent_at?->toISOString(),
            'status' => $this->status,
            'retry_count' => $this->retry_count,
            'max_retries' => $this->max_retries,
            'last_error' => $this->last_error,
            'next_retry_at' => $this->next_retry_at?->toISOString(),
            'template' => new NotificationTemplateResource($this->whenLoaded('template')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
