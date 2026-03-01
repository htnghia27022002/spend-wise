<?php

declare(strict_types=1);

namespace App\Repositories\Email;

use App\Models\Email\EmailTemplate;
use App\Repositories\BaseRepository;

final class EmailTemplateRepository extends BaseRepository
{
    public function __construct()
    {
        $this->model = new EmailTemplate();
    }

    /**
     * Find template by slug
     */
    public function findBySlug(string $slug): ?EmailTemplate
    {
        return EmailTemplate::active()->bySlug($slug)->first();
    }

    /**
     * Get all active templates
     */
    public function getAllActive()
    {
        return EmailTemplate::active()->orderBy('name')->get();
    }

    /**
     * Get default template
     */
    public function getDefault(): ?EmailTemplate
    {
        return EmailTemplate::active()
            ->where('is_default', true)
            ->first();
    }

    /**
     * Search templates by name or description
     */
    public function search(string $query)
    {
        return EmailTemplate::where(function ($q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
                ->orWhere('description', 'like', "%{$query}%")
                ->orWhere('slug', 'like', "%{$query}%");
        })
            ->active()
            ->orderBy('name')
            ->get();
    }
}
