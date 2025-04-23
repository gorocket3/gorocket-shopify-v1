<?php

namespace App\Providers;

use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

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
            $shop = $request->get('shop') ?? $request->header('X-Shopify-Shop-Domain') ?? optional($request->user())->shop_domain;
            if (!$shop && $referer = $request->headers->get('referer')) {
                parse_str(parse_url($referer, PHP_URL_QUERY), $queryParams);
                $shop = $queryParams['shop'] ?? null;
            }

            $shop = Str::lower($shop ?? 'unknown');
            $whitelist = [
                'gorockettest.myshopify.com',
                'jokebear-test.myshopify.com'
            ];

            if (in_array($shop, $whitelist)) {
                return Limit::none();
            }
            return Limit::perMinutes(30, 1)->by('shop:' . $shop);
        });
    }
}
