<?php

declare(strict_types=1);

namespace App\Services\Email\Adapters\Smtp;

use App\Services\Email\Adapters\EmailAdapterInterface;

final class Service implements EmailAdapterInterface
{
    private Client $client;
    private array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
        $this->client = new Client($config);
    }

    /**
     * Send email via SMTP
     */
    public function send(array $data): array
    {
        return $this->client->sendEmail($data);
    }

    /**
     * Test SMTP connection
     */
    public function test(): array
    {
        $result = $this->client->testConnection();
        
        return [
            'success' => $result['success'],
            'message' => $result['success'] 
                ? 'SMTP connection successful' 
                : 'Failed: ' . ($result['error'] ?? 'Unknown error'),
        ];
    }

    /**
     * Get adapter name
     */
    public function getName(): string
    {
        return 'SMTP';
    }
}
