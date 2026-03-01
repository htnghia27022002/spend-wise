<?php

namespace App\Providers;

use App\Contracts\Calendar\CalendarRepositoryInterface;
use App\Contracts\Calendar\CalendarServiceInterface;
use App\Contracts\Email\EmailProviderRepositoryInterface;
use App\Contracts\Email\EmailServiceInterface;
use App\Contracts\Email\EmailTemplateRepositoryInterface;
use App\Contracts\Notification\NotificationServiceInterface;
use App\Repositories\Calendar\CalendarRepository;
use App\Repositories\Email\EmailProviderRepository;
use App\Repositories\Email\EmailTemplateRepository;
use App\Services\Calendar\CalendarService;
use App\Services\Email\EmailService;
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
        // Calendar bindings
        $this->app->bind(CalendarRepositoryInterface::class, CalendarRepository::class);
        $this->app->bind(CalendarServiceInterface::class, CalendarService::class);

        // Email bindings
        $this->app->bind(EmailProviderRepositoryInterface::class, EmailProviderRepository::class);
        $this->app->bind(EmailTemplateRepositoryInterface::class, EmailTemplateRepository::class);
        $this->app->bind(EmailServiceInterface::class, EmailService::class);

        // Notification bindings
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
