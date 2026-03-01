<?php

declare(strict_types=1);

namespace App\Services\Email\Adapters\AwsSes;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

final class Client
{
    private array $config;
    private string $region;
    private string $endpoint;

    public function __construct(array $config)
    {
        $this->config = $config;
        $this->region = $config['region'] ?? 'us-east-1';
        $this->endpoint = "https://email.{$this->region}.amazonaws.com";
    }

    /**
     * Send email via AWS SES API
     */
    public function sendEmail(array $data): array
    {
        try {
            $payload = $this->buildPayload($data);
            $headers = $this->getAuthHeaders('SendRawEmail', $payload);

            $response = Http::withHeaders($headers)
                ->post($this->endpoint, $payload);

            if ($response->successful()) {
                $xml = simplexml_load_string($response->body());
                $messageId = (string) $xml->SendRawEmailResponse->SendRawEmailResult->MessageId;

                return [
                    'success' => true,
                    'message_id' => $messageId,
                ];
            }

            return [
                'success' => false,
                'error' => $response->body(),
                'status_code' => $response->status(),
            ];
        } catch (\Exception $e) {
            Log::error('AWS SES send error', [
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verify email address
     */
    public function verifyEmailAddress(string $email): array
    {
        try {
            $payload = [
                'Action' => 'VerifyEmailIdentity',
                'EmailAddress' => $email,
            ];

            $headers = $this->getAuthHeaders('VerifyEmailIdentity', $payload);
            $response = Http::withHeaders($headers)->post($this->endpoint, $payload);

            return [
                'success' => $response->successful(),
                'message' => $response->successful() 
                    ? 'Verification email sent' 
                    : $response->body(),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Build SES API payload
     */
    private function buildPayload(array $data): array
    {
        // For simplicity, using SendRawEmail API
        // In production, you might want to use AWS SDK
        return [
            'Action' => 'SendRawEmail',
            'Source' => $data['from']['email'] ?? $this->config['from_email'],
            'Destinations.member.1' => is_array($data['to']) ? $data['to'][0] : $data['to'],
            'RawMessage.Data' => base64_encode($this->buildRawMessage($data)),
        ];
    }

    /**
     * Build raw email message
     */
    private function buildRawMessage(array $data): string
    {
        $from = $data['from']['email'] ?? $this->config['from_email'];
        $fromName = $data['from']['name'] ?? $this->config['from_name'] ?? '';
        $to = is_array($data['to']) ? implode(', ', $data['to']) : $data['to'];

        $message = "From: {$fromName} <{$from}>\r\n";
        $message .= "To: {$to}\r\n";
        $message .= "Subject: {$data['subject']}\r\n";
        $message .= "MIME-Version: 1.0\r\n";
        $message .= "Content-Type: text/html; charset=UTF-8\r\n\r\n";
        $message .= $data['body'];

        return $message;
    }

    /**
     * Get AWS signature v4 headers
     * Note: This is a simplified version. Consider using AWS SDK for production
     */
    private function getAuthHeaders(string $action, array $payload): array
    {
        $date = gmdate('Ymd\THis\Z');
        
        return [
            'Content-Type' => 'application/x-www-form-urlencoded',
            'X-Amz-Date' => $date,
            // In production, implement proper AWS Signature V4
            // For now, recommend using AWS SDK package
        ];
    }
}
