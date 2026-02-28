<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

final class DatabaseReset extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'db:reset
                            {--seed : Seed the database after resetting}
                            {--force : Force the operation to run in production}';

    /**
     * The console command description.
     */
    protected $description = 'Reset database and optionally seed it with sample data';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if ($this->laravel->environment('production') && ! $this->option('force')) {
            $this->error('Cannot run in production without --force flag');
            return self::FAILURE;
        }

        $this->warn('⚠️  This will DELETE ALL DATA in the database!');
        
        if (! $this->confirm('Are you sure you want to continue?', false)) {
            $this->info('Operation cancelled.');
            return self::SUCCESS;
        }

        $this->newLine();
        $this->info('🚀 Starting database reset...');
        $this->newLine();

        // Step 1: Fresh migrations
        $this->components->task('Running fresh migrations', function () {
            Artisan::call('migrate:fresh', ['--force' => true]);
        });

        // Step 2: Seed if requested
        if ($this->option('seed')) {
            $this->components->task('Seeding database', function () {
                Artisan::call('db:seed', ['--force' => true]);
            });
        }

        // Step 3: Clear cache
        $this->components->task('Clearing cache', function () {
            Artisan::call('optimize:clear');
        });

        $this->newLine();
        $this->components->info('✨ Database reset complete!');
        $this->newLine();

        // Show stats
        $this->table(
            ['Resource', 'Count'],
            [
                ['Users', \App\Models\User::count()],
                ['Calendar Events', \App\Models\Calendar\CalendarEvent::count()],
                ['Calendar Reminders', \App\Models\Calendar\CalendarReminder::count()],
            ]
        );

        if ($this->option('seed')) {
            $this->newLine();
            $this->components->info('🔐 Test Login: test@example.com / password');
        }

        return self::SUCCESS;
    }
}
