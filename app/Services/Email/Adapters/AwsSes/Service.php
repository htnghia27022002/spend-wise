<?php

declare(strict_types=1);

namespace App\Services\Email\Adapters\AwsSes;

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
     * Send email via AWS SES
     */
    public function send(array $data): array
    {
        return $this->client->sendEmail($data);
    }

    /**
     * Test AWS SES connection
     */
    public function test(): array
    {
        // Test by verifying sending email address
        $email = $this->config['from_email'];
        $result = $this->client->verifyEmailAddress($email);
        
        return [
            'success' => $result['success'],
            'message' => $result['success'] 
                ? 'AWS SES connection successful' 
                : 'Failed: ' . ($result['error'] ?? 'Unknown error'),
        ];
    }

    /**
     * Get adapter name
     */
    public function getName(): string
    {
        return 'AWS SES';
    }
}
