<?php

namespace App\Listeners;

use App\Jobs\HandleShopUpdateJob;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Log;
use Osiset\ShopifyApp\Messaging\Events\AppInstalledEvent;

class HandleShopUpdateListener
{
    /**
     * Handle the app installed event.
     *
     * @param AppInstalledEvent $event
     * @return void
     */
    public function handle(AppInstalledEvent $event): void
    {
        try {
            $shopId = $event->shopId->toNative();

            $shop = User::find($shopId);
            if (!$shop) {
                Log::error("Shop not found. Shop ID: {$shopId}");
                return;
            }

            $response = $shop->api()->rest('GET', '/admin/api/2025-01/shop.json');
            if ($response['errors'] ?? false) {
                Log::error("Failed to call Shopify API - Shop ID: {$shopId}");
                return;
            }

            $container = (array) $response['body']['shop']['container'];

            HandleShopUpdateJob::dispatch($container);

            Log::info("Shop information queued successfully - Domain: {$container['myshopify_domain']}");
        } catch (Exception $e) {
            Log::error("Error occurred during app installation handling: " . $e->getMessage());
        }
    }
}
