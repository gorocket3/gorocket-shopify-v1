<?php

namespace App\Providers;

use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;
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
    public function boot(): void
    {
        /**
         * Custom Rate Limiter for AI usage
         * 10 minutes, 1 request
         */
        RateLimiter::for('custom-throttle', function ($request) {
            $ip = $request->header('CF-Connecting-IP', $request->ip());

            $whitelist = [
                '121.67.5.167'
            ];

            if (in_array($ip, $whitelist)) {
                return Limit::none();
            }
            return Limit::perMinutes(30, 1)->by('ip:' . $ip);
        });
    }
}
