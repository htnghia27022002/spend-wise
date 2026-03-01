<?php

declare(strict_types=1);

namespace App\Services\Email;

use App\Contracts\Email\EmailServiceInterface;
use App\Contracts\Email\EmailProviderRepositoryInterface;
use App\Contracts\Email\EmailTemplateRepositoryInterface;
use App\Models\Email\EmailProvider;
use App\Models\Email\EmailTemplate;
use App\Services\Email\Adapters\EmailAdapterInterface;
use App\Services\Email\Adapters\SendGrid\Service as SendGridService;
use App\Services\Email\Adapters\Smtp\Service as SmtpService;
use App\Services\Email\Adapters\AwsSes\Service as AwsSesService;
use Illuminate\Support\Facades\Log;

final class EmailService implements EmailServiceInterface
{
    public function __construct(
        private readonly EmailProviderRepositoryInterface $providerRepository,
        private readonly EmailTemplateRepositoryInterface $templateRepository,
    ) {}
    /**
     * Get adapter instance for provider
     */
    private function getAdapter(EmailProvider $provider): EmailAdapterInterface
    {
        $config = $provider->config;

        return match ($provider->driver) {
            'sendgrid' => new SendGridService($config),
            'smtp' => new SmtpService($config),
            'aws_ses' => new AwsSesService($config),
            default => throw new \InvalidArgumentException("Unsupported email driver: {$provider->driver}"),
        };
    }

    /**
     * Send email using default active provider
     */
    public function send(array $data): bool
    {
        $provider = $this->getActiveProvider();

        if (!$provider) {
            Log::error('No active email provider configured');
            return false;
        }

        return $this->sendViaProvider($provider->id, $data);
    }

    /**
     * Send email using specific provider
     */
    public function sendViaProvider(int $providerId, array $data): bool
    {
        $provider = $this->providerRepository->findById($providerId);

        if (!$provider || !$provider->is_active) {
            Log::error('Email provider not found or inactive', ['provider_id' => $providerId]);
            return false;
        }

        try {
            $adapter = $this->getAdapter($provider);
            $result = $adapter->send($data);

            // Update last used timestamp
            $provider->markAsUsed();

            // Log send result
            $this->logSendResult($provider, $data, $result);

            return $result['success'] ?? false;
        } catch (\Exception $e) {
            Log::error('Email send failed', [
                'provider_id' => $providerId,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Send email using template
     */
    public function sendWithTemplate(string $templateSlug, array $to, array $variables, ?int $providerId = null): bool
    {
        $template = $this->templateRepository->findBySlug($templateSlug);

        if (!$template) {
            Log::error('Email template not found', ['slug' => $templateSlug]);
            return false;
        }

        // Validate required variables
        $missing = $template->validateVariables($variables);
        if (!empty($missing)) {
            Log::error('Missing template variables', ['missing' => $missing]);
            return false;
        }

        // Render template
        $rendered = $template->render($variables);

        // Prepare email data
        $data = [
            'to' => $to,
            'subject' => $rendered['subject'],
            'body' => $rendered['body'],
            'text_body' => $rendered['text_body'],
        ];

        // Send via specific provider or default
        return $providerId 
            ? $this->sendViaProvider($providerId, $data)
            : $this->send($data);
    }

    /**
     * Render template with data
     */
    public function renderTemplate(int $templateId, array $data): array
    {
        $template = $this->templateRepository->findById($templateId);

        if (!$template) {
            throw new \InvalidArgumentException("Template not found: {$templateId}");
        }

        return $template->render($data);
    }

    /**
     * Get active provider (default or highest priority)
     */
    public function getActiveProvider(): ?EmailProvider
    {
        // Try to get default provider first
        $provider = $this->providerRepository->getDefault();

        // If no default, get highest priority
        if (!$provider) {
            $providers = $this->providerRepository->getActivePrioritized();
            $provider = $providers->first();
        }

        return $provider;
    }

    /**
     * Test provider connection
     */
    public function testProvider(int $providerId): array
    {
        $provider = $this->providerRepository->findById($providerId);

        if (!$provider) {
            return [
                'success' => false,
                'message' => 'Provider not found',
            ];
        }

        try {
            $adapter = $this->getAdapter($provider);
            return $adapter->test();
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Test failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Log email send result
     */
    private function logSendResult(EmailProvider $provider, array $data, array $result): void
    {
        Log::info('Email sent', [
            'provider' => $provider->name,
            'driver' => $provider->driver,
            'to' => $data['to'],
            'subject' => $data['subject'],
            'success' => $result['success'],
            'message_id' => $result['message_id'] ?? null,
        ]);
    }
}