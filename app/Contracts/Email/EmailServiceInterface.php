<?php

declare(strict_types=1);

namespace App\Contracts\Email;

use App\Models\Email\EmailProvider;

interface EmailServiceInterface
{
    /**
     * Send email using configured provider
     */
    public function send(array $data): bool;

    /**
     * Send using specific provider
     */
    public function sendViaProvider(int $providerId, array $data): bool;

    /**
     * Send email using template
     */
    public function sendWithTemplate(string $templateSlug, array $to, array $variables, ?int $providerId = null): bool;

    /**
     * Render template with data
     */
    public function renderTemplate(int $templateId, array $data): array;

    /**
     * Get active provider
     */
    public function getActiveProvider(): ?EmailProvider;

    /**
     * Test provider connection
     */
    public function testProvider(int $providerId): array;
}
