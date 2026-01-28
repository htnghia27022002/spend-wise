<?php

namespace App\Console;

use App\Jobs\Finance\ProcessFinanceScheduledJob;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Process finance scheduled items (subscriptions and installments) daily
        $schedule->job(new ProcessFinanceScheduledJob())
            ->dailyAt('00:00')
            ->timezone('Asia/Ho_Chi_Minh')
            ->name('process-finance-scheduled')
            ->onOneServer();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
