<?php

declare(strict_types=1);

namespace App\Models\Email;

use Illuminate\Database\Eloquent\Model;

final class EmailTemplate extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'subject',
        'body',
        'text_body',
        'variables',
        'metadata',
        'is_active',
        'is_default',
        'description',
    ];

    protected $casts = [
        'variables' => 'array',
        'metadata' => 'array',
        'is_active' => 'boolean',
        'is_default' => 'boolean',
    ];

    /**
     * Get active templates
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Find by slug
     */
    public function scopeBySlug($query, string $slug)
    {
        return $query->where('slug', $slug);
    }

    /**
     * Render template with variables
     */
    public function render(array $data): array
    {
        $subject = $this->replaceVariables($this->subject, $data);
        $body = $this->replaceVariables($this->body, $data);
        $textBody = $this->text_body ? $this->replaceVariables($this->text_body, $data) : null;

        return [
            'subject' => $subject,
            'body' => $body,
            'text_body' => $textBody,
        ];
    }

    /**
     * Replace {{variables}} with actual data
     */
    private function replaceVariables(string $content, array $data): string
    {
        foreach ($data as $key => $value) {
            $content = str_replace('{{' . $key . '}}', (string) $value, $content);
        }
        return $content;
    }

    /**
     * Get list of variables used in template
     */
    public function getUsedVariables(): array
    {
        // Extract all {{variable}} patterns
        $pattern = '/\{\{([a-zA-Z0-9_]+)\}\}/';
        $matches = [];
        
        preg_match_all($pattern, $this->subject . ' ' . $this->body, $matches);
        
        return array_unique($matches[1] ?? []);
    }

    /**
     * Validate that all required variables are provided
     */
    public function validateVariables(array $data): array
    {
        $required = $this->variables ?? [];
        $missing = [];

        foreach ($required as $var) {
            if (!isset($data[$var])) {
                $missing[] = $var;
            }
        }

        return $missing;
    }
}
