<?php

declare(strict_types=1);

namespace App\Services\Email\Adapters;

interface EmailAdapterInterface
{
    /**
     * Send email
     * 
     * @param array $data ['to', 'subject', 'body', 'from', 'cc', 'bcc', 'attachments']
     * @return array ['success' => bool, 'message_id' => string|null, 'error' => string|null]
     */
    public function send(array $data): array;

    /**
     * Test connection/configuration
     * 
     * @return array ['success' => bool, 'message' => string]
     */
    public function test(): array;

    /**
     * Get adapter name
     */
    public function getName(): string;
}
