<?php

declare(strict_types=1);

namespace App\Models\Email;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class EmailProvider extends Model
{
    protected $fillable = [
        'name',
        'driver',
        'config',
        'is_active',
        'is_default',
        'priority',
        'last_used_at',
        'description',
    ];

    protected $casts = [
        'config' => 'encrypted:array',
        'is_active' => 'boolean',
        'is_default' => 'boolean',
        'priority' => 'integer',
        'last_used_at' => 'datetime',
    ];

    /**
     * Get active providers
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get default provider
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Order by priority descending
     */
    public function scopeByPriority($query)
    {
        return $query->orderBy('priority', 'desc');
    }

    /**
     * Mark provider as used
     */
    public function markAsUsed(): void
    {
        $this->update(['last_used_at' => now()]);
    }

    /**
     * Check if provider needs required config keys
     */
    public function hasRequiredConfig(array $keys): bool
    {
        foreach ($keys as $key) {
            if (!isset($this->config[$key]) || empty($this->config[$key])) {
                return false;
            }
        }
        return true;
    }
}
