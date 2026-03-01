<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Email\EmailProvider;
use Illuminate\Database\Seeder;

final class EmailProviderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $providers = [
            [
                'name' => 'Default SMTP',
                'driver' => 'smtp',
                'config' => [
                    'host' => env('MAIL_HOST', 'smtp.gmail.com'),
                    'port' => env('MAIL_PORT', 587),
                    'encryption' => env('MAIL_ENCRYPTION', 'tls'),
                    'username' => env('MAIL_USERNAME'),
                    'password' => env('MAIL_PASSWORD'),
                    'from_email' => env('MAIL_FROM_ADDRESS', 'noreply@example.com'),
                    'from_name' => env('MAIL_FROM_NAME', 'SpendWise'),
                ],
                'is_active' => true,
                'is_default' => true,
                'priority' => 10,
                'description' => 'Default SMTP provider from environment config',
            ],
            [
                'name' => 'SendGrid',
                'driver' => 'sendgrid',
                'config' => [
                    'api_key' => env('SENDGRID_API_KEY', ''),
                    'from_email' => env('MAIL_FROM_ADDRESS', 'noreply@example.com'),
                    'from_name' => env('MAIL_FROM_NAME', 'SpendWise'),
                ],
                'is_active' => false,
                'is_default' => false,
                'priority' => 5,
                'description' => 'SendGrid email service provider',
            ],
            [
                'name' => 'AWS SES',
                'driver' => 'aws_ses',
                'config' => [
                    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
                    'access_key' => env('AWS_ACCESS_KEY_ID', ''),
                    'secret_key' => env('AWS_SECRET_ACCESS_KEY', ''),
                    'from_email' => env('MAIL_FROM_ADDRESS', 'noreply@example.com'),
                    'from_name' => env('MAIL_FROM_NAME', 'SpendWise'),
                ],
                'is_active' => false,
                'is_default' => false,
                'priority' => 3,
                'description' => 'Amazon Simple Email Service',
            ],
        ];

        foreach ($providers as $provider) {
            EmailProvider::create($provider);
        }
    }
}
