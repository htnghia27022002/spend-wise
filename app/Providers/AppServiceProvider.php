<?php

namespace App\Providers;

use App\Contracts\Finance\CategoryServiceInterface;
use App\Contracts\Finance\InstallmentServiceInterface;
use App\Contracts\Finance\SubscriptionServiceInterface;
use App\Contracts\Finance\TransactionServiceInterface;
use App\Contracts\Finance\WalletServiceInterface;
use App\Contracts\Notification\NotificationServiceInterface;
use App\Services\Finance\CategoryService;
use App\Services\Finance\InstallmentService;
use App\Services\Finance\SubscriptionService;
use App\Services\Finance\TransactionService;
use App\Services\Finance\WalletService;
use App\Services\Notification\NotificationService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Finance Services
        $this->app->bind(WalletServiceInterface::class, WalletService::class);
        $this->app->bind(CategoryServiceInterface::class, CategoryService::class);
        $this->app->bind(TransactionServiceInterface::class, TransactionService::class);
        $this->app->bind(SubscriptionServiceInterface::class, SubscriptionService::class);
        $this->app->bind(InstallmentServiceInterface::class, InstallmentService::class);
        $this->app->bind(NotificationServiceInterface::class, NotificationService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }
}
