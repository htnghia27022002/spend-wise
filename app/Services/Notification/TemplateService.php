<?php

declare(strict_types=1);

namespace App\Services\Notification;

use App\Models\Notification\NotificationTemplate;
use App\Repositories\Notification\TemplateRepository;

final class TemplateService
{
    public function __construct(
        private readonly TemplateRepository $repository,
    ) {}

    public function create(array $data): NotificationTemplate
    {
        // If setting as default, unset other defaults for same type/channel
        if ($data['is_default'] ?? false) {
            NotificationTemplate::where('type', $data['type'])
                ->where('channel', $data['channel'])
                ->update(['is_default' => false]);
        }

        return NotificationTemplate::create([
            'name' => $data['name'],
            'type' => $data['type'],
            'channel' => $data['channel'],
            'subject' => $data['subject'] ?? null,
            'body' => $data['body'],
            'variables' => $data['variables'] ?? [],
            'is_active' => $data['is_active'] ?? true,
            'is_default' => $data['is_default'] ?? false,
        ]);
    }

    public function update(int $id, array $data): ?NotificationTemplate
    {
        $template = $this->repository->findById($id);
        
        if (!$template) {
            return null;
        }

        // If setting as default, unset other defaults for same type/channel
        if (($data['is_default'] ?? false) && !$template->is_default) {
            NotificationTemplate::where('type', $template->type)
                ->where('channel', $template->channel)
                ->where('id', '!=', $id)
                ->update(['is_default' => false]);
        }

        $template->update([
            'name' => $data['name'] ?? $template->name,
            'type' => $data['type'] ?? $template->type,
            'channel' => $data['channel'] ?? $template->channel,
            'subject' => $data['subject'] ?? $template->subject,
            'body' => $data['body'] ?? $template->body,
            'variables' => $data['variables'] ?? $template->variables,
            'is_active' => $data['is_active'] ?? $template->is_active,
            'is_default' => $data['is_default'] ?? $template->is_default,
        ]);

        return $template->fresh();
    }

    public function delete(int $id): bool
    {
        $template = $this->repository->findById($id);
        
        if (!$template) {
            return false;
        }

        return $template->delete();
    }

    public function preview(int $id, array $sampleData): ?array
    {
        $template = $this->repository->findById($id);
        
        if (!$template) {
            return null;
        }

        return $template->render($sampleData);
    }

    public function renderForNotification(string $type, string $channel, array $data): ?array
    {
        $template = $this->repository->getByTypeAndChannel($type, $channel);
        
        if (!$template) {
            return null;
        }

        return $template->render($data);
    }
}
