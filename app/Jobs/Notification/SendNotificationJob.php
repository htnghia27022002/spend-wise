<?php

declare(strict_types=1);

namespace App\Jobs\Notification;

use App\Models\Notification\Notification;
use App\Repositories\Notification\ChannelSettingRepository;
use App\Repositories\Notification\TemplateRepository;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

final class SendNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private readonly int $notificationId,
    ) {}

    public function handle(
        ChannelSettingRepository $channelRepo,
        TemplateRepository $templateRepo
    ): void {
        $notification = Notification::find($this->notificationId);

        if (!$notification) {
            return;
        }

        // Skip if already sent
        if ($notification->status === 'sent') {
            return;
        }

        // Mark as sending
        $notification->markAsSending();

        try {
            $sent = match ($notification->channel) {
                'email' => $this->sendEmail($notification, $channelRepo, $templateRepo),
                'sms' => $this->sendSms($notification, $channelRepo),
                'push' => $this->sendPush($notification, $channelRepo),
                'database' => true, // Already stored in database
                default => false,
            };

            if ($sent) {
                $notification->markAsSent();
            } else {
                throw new \Exception("Failed to send notification via {$notification->channel}");
            }
        } catch (\Exception $e) {
            Log::error("Notification sending failed", [
                'notification_id' => $notification->id,
                'channel' => $notification->channel,
                'error' => $e->getMessage(),
            ]);

            $notification->markAsFailed($e->getMessage());
        }
    }

    private function sendEmail(
        Notification $notification,
        ChannelSettingRepository $channelRepo,
        TemplateRepository $templateRepo
    ): bool {
        $channelSetting = $channelRepo->findByChannel('email');

        if (!$channelSetting || !$channelSetting->is_active) {
            throw new \Exception('Email channel is not configured or inactive');
        }

        $config = $channelSetting->configuration;
        $user = $notification->user;

        // Get template if exists
        $body = $notification->message;
        $subject = $notification->title;

        if ($notification->template_id) {
            $template = $templateRepo->findById($notification->template_id);
            if ($template) {
                $rendered = $template->render($notification->data ?? []);
                $subject = $rendered['subject'];
                $body = $rendered['body'];
            }
        }

        // Configure mail transport
        config([
            'mail.mailers.notification_smtp' => [
                'transport' => 'smtp',
                'host' => $config['host'],
                'port' => $config['port'],
                'username' => $config['username'],
                'password' => $config['password'],
                'encryption' => $config['encryption'] ?? 'tls',
            ],
        ]);

        Mail::mailer('notification_smtp')->raw($body, function ($message) use ($user, $subject, $config) {
            $message->to($user->email)
                ->from($config['from_address'], $config['from_name'] ?? 'SpendWise')
                ->subject($subject);
        });

        return true;
    }

    private function sendSms(Notification $notification, ChannelSettingRepository $channelRepo): bool
    {
        $channelSetting = $channelRepo->findByChannel('sms');

        if (!$channelSetting || !$channelSetting->is_active) {
            throw new \Exception('SMS channel is not configured or inactive');
        }

        // TODO: Implement actual SMS sending with provider (Twilio, etc.)
        Log::info('SMS notification would be sent', [
            'notification_id' => $notification->id,
            'message' => $notification->message,
        ]);

        return true;
    }

    private function sendPush(Notification $notification, ChannelSettingRepository $channelRepo): bool
    {
        $channelSetting = $channelRepo->findByChannel('push');

        if (!$channelSetting || !$channelSetting->is_active) {
            throw new \Exception('Push channel is not configured or inactive');
        }

        // TODO: Implement actual push notification sending
        Log::info('Push notification would be sent', [
            'notification_id' => $notification->id,
            'message' => $notification->message,
        ]);

        return true;
    }
}
