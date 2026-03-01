<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Email\EmailTemplate;
use Illuminate\Database\Seeder;

final class EmailTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Welcome Email',
                'slug' => 'welcome-email',
                'subject' => 'Welcome to {{app_name}}, {{user_name}}!',
                'body' => $this->getWelcomeEmailBody(),
                'text_body' => $this->getWelcomeEmailText(),
                'variables' => ['app_name', 'user_name', 'user_email', 'login_url'],
                'metadata' => [
                    'preheader' => 'Get started with your account',
                    'category' => 'onboarding',
                ],
                'is_active' => true,
                'is_default' => false,
                'description' => 'Welcome email sent to new users after registration',
            ],
            [
                'name' => 'Password Reset',
                'slug' => 'password-reset',
                'subject' => 'Reset Your Password - {{app_name}}',
                'body' => $this->getPasswordResetBody(),
                'text_body' => $this->getPasswordResetText(),
                'variables' => ['app_name', 'user_name', 'reset_url', 'expiry_time'],
                'metadata' => [
                    'preheader' => 'Click to reset your password',
                    'category' => 'security',
                ],
                'is_active' => true,
                'is_default' => false,
                'description' => 'Password reset email with secure link',
            ],
            [
                'name' => 'Email Verification',
                'slug' => 'email-verification',
                'subject' => 'Verify Your Email - {{app_name}}',
                'body' => $this->getEmailVerificationBody(),
                'text_body' => $this->getEmailVerificationText(),
                'variables' => ['app_name', 'user_name', 'verify_url', 'expiry_time'],
                'metadata' => [
                    'preheader' => 'Confirm your email address',
                    'category' => 'security',
                ],
                'is_active' => true,
                'is_default' => false,
                'description' => 'Email verification link for new users',
            ],
            [
                'name' => 'Calendar Event Reminder',
                'slug' => 'calendar-reminder',
                'subject' => 'Reminder: {{event_title}} - {{event_date}}',
                'body' => $this->getCalendarReminderBody(),
                'text_body' => $this->getCalendarReminderText(),
                'variables' => ['user_name', 'event_title', 'event_date', 'event_time', 'event_description', 'view_url'],
                'metadata' => [
                    'preheader' => 'Upcoming event reminder',
                    'category' => 'notification',
                ],
                'is_active' => true,
                'is_default' => false,
                'description' => 'Reminder for upcoming calendar events',
            ],
        ];

        foreach ($templates as $template) {
            EmailTemplate::create($template);
        }
    }

    private function getWelcomeEmailBody(): string
    {
        return <<<'HTML'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h1 style="color: #2563eb; margin-bottom: 20px;">Welcome to {{app_name}}! 🎉</h1>
        
        <p>Hi {{user_name}},</p>
        
        <p>Thank you for creating an account with us. We're excited to have you on board!</p>
        
        <p>Your account has been successfully created with the email: <strong>{{user_email}}</strong></p>
        
        <div style="background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #1e40af; font-size: 18px;">Get Started</h2>
            <p>Click the button below to log in and start managing your finances:</p>
            <a href="{{login_url}}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0;">Log In Now</a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            If you have any questions, feel free to reach out to our support team.
        </p>
        
        <p>Best regards,<br>The {{app_name}} Team</p>
    </div>
</body>
</html>
HTML;
    }

    private function getWelcomeEmailText(): string
    {
        return <<<'TEXT'
Welcome to {{app_name}}!

Hi {{user_name}},

Thank you for creating an account with us. We're excited to have you on board!

Your account has been successfully created with the email: {{user_email}}

Get Started:
Click the link below to log in and start managing your finances:
{{login_url}}

If you have any questions, feel free to reach out to our support team.

Best regards,
The {{app_name}} Team
TEXT;
    }

    private function getPasswordResetBody(): string
    {
        return <<<'HTML'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h1 style="color: #dc2626;">Password Reset Request</h1>
        
        <p>Hi {{user_name}},</p>
        
        <p>We received a request to reset your password for your {{app_name}} account.</p>
        
        <div style="background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p>Click the button below to reset your password:</p>
            <a href="{{reset_url}}" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0;">Reset Password</a>
            <p style="color: #6b7280; font-size: 14px; margin-top: 15px;">
                This link will expire in {{expiry_time}}.
            </p>
        </div>
        
        <p style="color: #dc2626; background-color: #fef2f2; padding: 15px; border-radius: 5px; border-left: 4px solid #dc2626;">
            <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email or contact support if you have concerns.
        </p>
        
        <p>Best regards,<br>The {{app_name}} Team</p>
    </div>
</body>
</html>
HTML;
    }

    private function getPasswordResetText(): string
    {
        return <<<'TEXT'
Password Reset Request

Hi {{user_name}},

We received a request to reset your password for your {{app_name}} account.

Click the link below to reset your password:
{{reset_url}}

This link will expire in {{expiry_time}}.

Security Notice: If you didn't request this password reset, please ignore this email or contact support if you have concerns.

Best regards,
The {{app_name}} Team
TEXT;
    }

    private function getEmailVerificationBody(): string
    {
        return <<<'HTML'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h1 style="color: #2563eb;">Verify Your Email Address</h1>
        
        <p>Hi {{user_name}},</p>
        
        <p>Thank you for signing up with {{app_name}}! To complete your registration, please verify your email address.</p>
        
        <div style="background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p>Click the button below to verify your email:</p>
            <a href="{{verify_url}}" style="display: inline-block; background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0;">Verify Email</a>
            <p style="color: #6b7280; font-size: 14px; margin-top: 15px;">
                This link will expire in {{expiry_time}}.
            </p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
            If you didn't create an account with {{app_name}}, you can safely ignore this email.
        </p>
        
        <p>Best regards,<br>The {{app_name}} Team</p>
    </div>
</body>
</html>
HTML;
    }

    private function getEmailVerificationText(): string
    {
        return <<<'TEXT'
Verify Your Email Address

Hi {{user_name}},

Thank you for signing up with {{app_name}}! To complete your registration, please verify your email address.

Click the link below to verify your email:
{{verify_url}}

This link will expire in {{expiry_time}}.

If you didn't create an account with {{app_name}}, you can safely ignore this email.

Best regards,
The {{app_name}} Team
TEXT;
    }

    private function getCalendarReminderBody(): string
    {
        return <<<'HTML'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h1 style="color: #7c3aed;">📅 Event Reminder</h1>
        
        <p>Hi {{user_name}},</p>
        
        <p>This is a reminder for your upcoming event:</p>
        
        <div style="background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #7c3aed;">
            <h2 style="color: #7c3aed; margin-top: 0;">{{event_title}}</h2>
            <p style="margin: 10px 0;">
                <strong>Date:</strong> {{event_date}}<br>
                <strong>Time:</strong> {{event_time}}
            </p>
            <p style="color: #6b7280;">{{event_description}}</p>
        </div>
        
        <div style="margin: 20px 0;">
            <a href="{{view_url}}" style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">View Event Details</a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
            Make sure you're prepared for this event!
        </p>
        
        <p>Best regards,<br>The {{app_name}} Team</p>
    </div>
</body>
</html>
HTML;
    }

    private function getCalendarReminderText(): string
    {
        return <<<'TEXT'
Event Reminder

Hi {{user_name}},

This is a reminder for your upcoming event:

Event: {{event_title}}
Date: {{event_date}}
Time: {{event_time}}

Description:
{{event_description}}

View event details: {{view_url}}

Make sure you're prepared for this event!

Best regards,
The {{app_name}} Team
TEXT;
    }
}
