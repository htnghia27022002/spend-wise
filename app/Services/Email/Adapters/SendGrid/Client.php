<?php

declare(strict_types=1);

namespace App\Services\Email\Adapters\SendGrid;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

final class Client
{
    private string $apiKey;
    private string $apiUrl = 'https://api.sendgrid.com/v3/mail/send';

    public function __construct(array $config)
    {
        $this->apiKey = $config['api_key'] ?? '';
    }

    /**
     * Send email via SendGrid API
     */
    public function sendEmail(array $payload): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post($this->apiUrl, $payload);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message_id' => $response->header('X-Message-Id'),
                    'status_code' => $response->status(),
                ];
            }

            return [
                'success' => false,
                'error' => $response->json()['errors'][0]['message'] ?? 'Unknown error',
                'status_code' => $response->status(),
            ];
        } catch (\Exception $e) {
            Log::error('SendGrid API error', [
                'error' => $e->getMessage(),
                'payload' => $payload,
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verify API key
     */
    public function verifyApiKey(): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
            ])->get('https://api.sendgrid.com/v3/scopes');

            return [
                'success' => $response->successful(),
                'scopes' => $response->json()['scopes'] ?? [],
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
