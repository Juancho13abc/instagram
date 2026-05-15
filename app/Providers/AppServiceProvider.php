<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
use Illuminate\Support\Facades\URL;

    public function boot(): void
    {
        if (config('app.env') === 'production' || str_contains(request()->getHost(), 'azurewebsites.net')) {
            URL::forceScheme('https');
        }
    }
}
