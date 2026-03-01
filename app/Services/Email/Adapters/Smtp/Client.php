<?php

declare(strict_types=1);

namespace App\Services\Email\Adapters\Smtp;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Mail\Message;

final class Client
{
    private array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    /**
     * Send email via SMTP
     */
    public function sendEmail(array $data): array
    {
        try {
            // Configure mailer with SMTP settings
            config([
                'mail.mailers.custom_smtp' => [
                    'transport' => 'smtp',
                    'host' => $this->config['host'],
                    'port' => $this->config['port'],
                    'encryption' => $this->config['encryption'] ?? 'tls',
                    'username' => $this->config['username'],
                    'password' => $this->config['password'],
                ],
                'mail.from' => [
                    'address' => $this->config['from_email'],
                    'name' => $this->config['from_name'] ?? '',
                ],
            ]);

            Mail::mailer('custom_smtp')->send([], [], function (Message $message) use ($data) {
                $message->to($data['to'])
                    ->subject($data['subject'])
                    ->html($data['body']);

                if (isset($data['cc'])) {
                    $message->cc($data['cc']);
                }

                if (isset($data['bcc'])) {
                    $message->bcc($data['bcc']);
                }

                if (isset($data['attachments'])) {
                    foreach ($data['attachments'] as $attachment) {
                        $message->attach($attachment['path'], [
                            'as' => $attachment['filename'] ?? null,
                            'mime' => $attachment['type'] ?? null,
                        ]);
                    }
                }
            });

            return [
                'success' => true,
                'message_id' => null, // SMTP doesn't return message ID easily
            ];
        } catch (\Exception $e) {
            Log::error('SMTP send error', [
                'error' => $e->getMessage(),
                'config' => [
                    'host' => $this->config['host'],
                    'port' => $this->config['port'],
                ],
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Test SMTP connection
     */
    public function testConnection(): array
    {
        try {
            $transport = new \Swift_SmtpTransport(
                $this->config['host'],
                $this->config['port'],
                $this->config['encryption'] ?? null
            );

            $transport->setUsername($this->config['username']);
            $transport->setPassword($this->config['password']);
            $transport->start();

            return [
                'success' => true,
                'message' => 'SMTP connection successful',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
