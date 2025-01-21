<?php

use App\Services\BillingStatus;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

/**
 * Display an inspiring quote.
 */
Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

/**
 * Check billing status for all shops.
 */
Artisan::command('billing:check', function () {
    $billingChecker = app(BillingStatus::class);
    $billingChecker->checkBillingStatus();
    $this->info('Billing status check completed.');
})->purpose('Check billing status for all shops')->dailyAt('10:00');
