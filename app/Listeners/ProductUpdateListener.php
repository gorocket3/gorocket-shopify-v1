<?php

namespace App\Listeners;

use App\Jobs\Setup\ProductUpdateJob;
use App\Models\User;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Osiset\ShopifyApp\Messaging\Events\AppInstalledEvent;

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
        try {
            $shopId = $event->shopId->toNative();
            $shop = User::find($shopId);

            if (!$shop) {
                Log::error("Shop not found - {$shopId}");
                return;
            }

            $nextPage = null;
            do {
                $response = $shop->api()->rest('GET', '/admin/api/2025-01/products.json', [
                    'limit' => 250,
                    'page_info' => $nextPage
                ]);

                if (($response['errors'] ?? false) || !isset($response['body']['products'])) {
                    Log::error("Failed to call Shopify API for products - {$shopId}");
                    break;
                }

                $products = $response['body']['products'];
                foreach ($products as $product) {
                    $formattedProduct = [
                        'user_id'                => $shopId,
                        'id'                     => $product['id'],
                        'admin_graphql_api_id'   => $product['admin_graphql_api_id'],
                        'title'                  => $product['title'],
                        'handle'                 => $product['handle'],
                        'body_html'              => $product['body_html'],
                        'product_type'           => $product['product_type'],
                        'vendor'                 => $product['vendor'],
                        'status'                 => $product['status'],
                        'published_scope'        => $product['published_scope'],
                        'tags'                   => $product['tags'],
                        'published_at'           => $product['published_at'],
                        'created_at'             => $product['created_at'],
                        'updated_at'             => $product['updated_at']
                    ];

                    $productsBatch[] = $formattedProduct;

                    if (count($productsBatch) >= 100) {
                        ProductUpdateJob::dispatch($productsBatch);
                        $productsBatch = [];
                    }
                }
                $nextPage = $response['link']['next'] ?? null;
            } while ($nextPage);

            if (!empty($productsBatch)) {
                ProductUpdateJob::dispatch($productsBatch);
            }

            Log::info("All product information queued successfully - {$shopId}");
        } catch (Exception $e) {
            Log::error("Failed to queue product information - {$shopId}, Error: {$e->getMessage()}");
        }
    }
}
