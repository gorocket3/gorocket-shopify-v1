<?php

use App\Services\BillingService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

/**
 * Daily billing status check at 12 AM and 12 PM.
 */
Artisan::command('billing:check', function () {
    $billingChecker = app(BillingService::class);
    $billingChecker->checkBillingStatus();
    $this->info('Billing status check completed.');
})->purpose('Check billing status for all shops')->twiceDaily(0, 12);

/**
 * Daily database backup at 2 AM.
 */
Artisan::command('backup:database', function () {
    Artisan::call('backup:run --only-db');
    $this->info('Database backup completed.');
})->purpose('Backup the database daily')->dailyAt('07:00');

/**
 * Horizon metrics snapshot every minute
 */
Schedule::command('horizon:snapshot')->everyFiveMinutes();


