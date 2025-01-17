<?php

namespace App\Listeners;

use App\Jobs\Setup\ShopUpdateJob;
use App\Models\User;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Osiset\ShopifyApp\Messaging\Events\AppInstalledEvent;

class ShopUpdateListener implements ShouldQueue
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
        try {
            $shopId = $event->shopId->toNative();
            $shop = User::find($shopId);

            if (!$shop) {
                Log::error("Shop not found - {$shopId}");
                return;
            }

            $response = $shop->api()->rest('GET', '/admin/api/2025-01/shop.json');
            if (($response['errors'] ?? false) || !isset($response['body']['shop'])) {
                Log::error("Failed to call Shopify API - {$shopId}");
                return;
            }

            $shopData = $response['body']['shop'];
            $data = [
                'user_id'                     => $shopId,
                'id'                          => $shopData['id'],
                'myshopify_domain'            => $shopData['myshopify_domain'] ?? null,
                'name'                        => $shopData['name'] ?? null,
                'shop_owner'                  => $shopData['shop_owner'] ?? null,
                'email'                       => $shopData['email'] ?? null,
                'customer_email'              => $shopData['customer_email'] ?? null,
                'domain'                      => $shopData['domain'] ?? null,
                'country'                     => $shopData['country'] ?? null,
                'country_code'                => $shopData['country_code'] ?? null,
                'currency'                    => $shopData['currency'] ?? null,
                'timezone'                    => $shopData['timezone'] ?? null,
                'plan_name'                   => $shopData['plan_name'] ?? null,
                'plan_display_name'           => $shopData['plan_display_name'] ?? null,
                'has_storefront'              => $shopData['has_storefront'] ?? null,
                'password_enabled'            => $shopData['password_enabled'] ?? null,
                'checkout_api_supported'      => $shopData['checkout_api_supported'] ?? null,
                'enabled_presentment_currencies' => $shopData['enabled_presentment_currencies'] ?? [],
                'multi_location_enabled'      => $shopData['multi_location_enabled'] ?? null,
                'created_at'                  => $shopData['created_at'] ?? null,
                'updated_at'                  => $shopData['updated_at'] ?? null
            ];

            ShopUpdateJob::dispatch($data);

            Log::info("Shop information queued successfully - {$shopId}");
        } catch (Exception $e) {
            Log::error("Failed to queue shop information - {$shopId}, Error: {$e->getMessage()}");
        }
    }
}
