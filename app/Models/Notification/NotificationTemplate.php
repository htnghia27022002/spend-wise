<?php

declare(strict_types=1);

namespace App\Models\Notification;

use App\Enums\Notification\NotificationChannel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class NotificationTemplate extends Model
{
    protected $fillable = [
        'name',
        'type',
        'channel',
        'subject',
        'body',
        'variables',
        'is_active',
        'is_default',
    ];

    protected $casts = [
        'variables' => 'array',
        'is_active' => 'boolean',
        'is_default' => 'boolean',
        // Note: 'type' is string to support dynamic types via NotificationTypeRegistry
        'channel' => NotificationChannel::class,
    ];

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'template_id');
    }

    /**
     * Render template with provided data
     */
    public function render(array $data): array
    {
        $subject = $this->renderString($this->subject ?? '', $data);
        $body = $this->renderString($this->body, $data);

        return [
            'subject' => $subject,
            'body' => $body,
        ];
    }

    /**
     * Replace variables in string with actual values
     */
    private function renderString(string $template, array $data): string
    {
        foreach ($data as $key => $value) {
            $template = str_replace("{{" . $key . "}}", (string) $value, $template);
        }

        return $template;
    }

    /**
     * Get available variables for this template
     */
    public function getAvailableVariables(): array
    {
        return $this->variables ?? [];
    }
}
