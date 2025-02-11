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
                Log::error("[LISTENER][SHOP] Shop not found - {$shopId}");
                return;
            }

            $response = $shop->api()->rest('GET', '/admin/api/' . env('SHOPIFY_API_VERSION') . '/shop.json');
            if (($response['errors'] ?? false) || !isset($response['body']['shop'])) {
                Log::error("[LISTENER][SHOP] API failed - {$shopId}");
                return;
            }

            $shopData = $response['body']['shop'];
            $data = [
                'id'                          => $shopData['id'],
                'myshopify_domain'            => $shopData['myshopify_domain'],
                'name'                        => $shopData['name'],
                'shop_owner'                  => $shopData['shop_owner'],
                'email'                       => $shopData['email'],
                'customer_email'              => $shopData['customer_email'],
                'domain'                      => $shopData['domain'],
                'country'                     => $shopData['country'],
                'country_code'                => $shopData['country_code'],
                'currency'                    => $shopData['currency'],
                'timezone'                    => $shopData['timezone'],
                'plan_name'                   => $shopData['plan_name'],
                'plan_display_name'           => $shopData['plan_display_name'],
                'has_storefront'              => $shopData['has_storefront'],
                'password_enabled'            => $shopData['password_enabled'],
                'checkout_api_supported'      => $shopData['checkout_api_supported'],
                'enabled_presentment_currencies' => $shopData['enabled_presentment_currencies'],
                'multi_location_enabled'      => $shopData['multi_location_enabled'],
                'created_at'                  => $shopData['created_at'],
                'updated_at'                  => $shopData['updated_at'],
                'user_id'                     => $shopId
            ];

            ShopUpdateJob::dispatch($data);

            Log::info("[LISTENER][SHOP] Queued success - {$shopId}");
        } catch (Exception $e) {
            Log::error("[LISTENER][SHOP] Queue failed - {$shopId}, Error: {$e->getMessage()}");
        }
    }
}
