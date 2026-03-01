<?php

declare(strict_types=1);

namespace App\Services\Email\Adapters\SendGrid;

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
     * Send email via SendGrid
     */
    public function send(array $data): array
    {
        $payload = $this->buildPayload($data);
        return $this->client->sendEmail($payload);
    }

    /**
     * Test SendGrid connection
     */
    public function test(): array
    {
        $result = $this->client->verifyApiKey();
        
        return [
            'success' => $result['success'],
            'message' => $result['success'] 
                ? 'SendGrid connection successful' 
                : 'Failed: ' . ($result['error'] ?? 'Unknown error'),
        ];
    }

    /**
     * Get adapter name
     */
    public function getName(): string
    {
        return 'SendGrid';
    }

    /**
     * Build SendGrid API payload
     */
    private function buildPayload(array $data): array
    {
        $from = $data['from'] ?? [
            'email' => $this->config['from_email'],
            'name' => $this->config['from_name'] ?? '',
        ];

        $personalizations = [
            [
                'to' => $this->formatRecipients($data['to']),
                'subject' => $data['subject'],
            ],
        ];

        if (isset($data['cc']) && !empty($data['cc'])) {
            $personalizations[0]['cc'] = $this->formatRecipients($data['cc']);
        }

        if (isset($data['bcc']) && !empty($data['bcc'])) {
            $personalizations[0]['bcc'] = $this->formatRecipients($data['bcc']);
        }

        $payload = [
            'personalizations' => $personalizations,
            'from' => $from,
            'content' => [
                [
                    'type' => 'text/html',
                    'value' => $data['body'],
                ],
            ],
        ];

        // Add plain text version if provided
        if (isset($data['text_body'])) {
            $payload['content'][] = [
                'type' => 'text/plain',
                'value' => $data['text_body'],
            ];
        }

        // Add attachments if provided
        if (isset($data['attachments']) && !empty($data['attachments'])) {
            $payload['attachments'] = $this->formatAttachments($data['attachments']);
        }

        return $payload;
    }

    /**
     * Format recipients for SendGrid API
     */
    private function formatRecipients(array|string $recipients): array
    {
        if (is_string($recipients)) {
            return [['email' => $recipients]];
        }

        return array_map(function ($recipient) {
            if (is_string($recipient)) {
                return ['email' => $recipient];
            }
            return $recipient;
        }, $recipients);
    }

    /**
     * Format attachments for SendGrid API
     */
    private function formatAttachments(array $attachments): array
    {
        return array_map(function ($attachment) {
            return [
                'content' => base64_encode($attachment['content']),
                'filename' => $attachment['filename'],
                'type' => $attachment['type'] ?? 'application/octet-stream',
            ];
        }, $attachments);
    }
}
