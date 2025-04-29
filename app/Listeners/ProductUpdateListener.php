<?php

namespace App\Listeners;

use App\Jobs\Setup\SyncProcessJob;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Osiset\ShopifyApp\Messaging\Events\AppInstalledEvent;
use Illuminate\Support\Facades\Log;
use Throwable;

class ProductUpdateListener implements ShouldQueue
{
    /**
     * The number of times the job may be attempted.
     */
    use InteractsWithQueue;

    /**
     * Handle the app installed event.
     *
     * @param AppInstalledEvent $event
     * @return void
     */
    public function handle(AppInstalledEvent $event): void
    {
        $shopId = $event->shopId->toNative();

        try {
            SyncProcessJob::dispatch($shopId);
            Log::info("[LISTENER][PRODUCT] SyncProcessJob dispatched - {$shopId}");
        } catch (Throwable $e) {
            Log::error("[LISTENER][PRODUCT] Failed to dispatch SyncProcessJob - {$shopId}: {$e->getMessage()}");
        };
    }
}
