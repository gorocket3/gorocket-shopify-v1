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
                Log::error("[LISTENER][PRODUCT] Shop not found - {$shopId}");
                return;
            }

            $nextPage = null;
            do {
                $response = $shop->api()->rest('GET', '/admin/api/' . env('SHOPIFY_API_VERSION') . '/products.json', [
                    'limit' => 250,
                    'page_info' => $nextPage
                ]);

                if (($response['errors'] ?? false) || !isset($response['body']['products'])) {
                    Log::error("[LISTENER][PRODUCT] API failed - {$shopId}");
                    break;
                }

                $products = $response['body']['products'];
                foreach ($products as $product) {
                    $data = [
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
                        'updated_at'             => $product['updated_at'],
                        'user_id'                => $shopId,
                        'variants'               => !empty($product['variants']) ? array_map(function ($variant) {
                            return [
                                'variant_id'            => $variant['id'],
                                'product_id'            => $variant['product_id'],
                                'title'                 => $variant['title'],
                                'price'                 => $variant['price'],
                                'position'              => $variant['position'],
                                'inventory_policy'      => $variant['inventory_policy'],
                                'compare_at_price'      => $variant['compare_at_price'],
                                'option1'               => $variant['option1'],
                                'option2'               => $variant['option2'],
                                'option3'               => $variant['option3'],
                                'created_at'            => $variant['created_at'],
                                'updated_at'            => $variant['updated_at'],
                                'taxable'               => $variant['taxable'],
                                'barcode'               => $variant['barcode'],
                                'fulfillment_service'   => $variant['fulfillment_service'],
                                'grams'                 => $variant['grams'],
                                'inventory_management'  => $variant['inventory_management'],
                                'requires_shipping'     => $variant['requires_shipping'],
                                'sku'                   => $variant['sku'],
                                'weight'                => $variant['weight'],
                                'weight_unit'           => $variant['weight_unit'],
                                'inventory_item_id'     => $variant['inventory_item_id'],
                                'inventory_quantity'    => $variant['inventory_quantity'],
                                'old_inventory_quantity'=> $variant['old_inventory_quantity'],
                                'image_id'              => $variant['image_id'],
                                'admin_graphql_api_id'  => $variant['admin_graphql_api_id']
                            ];
                        }, $product['variants']->toArray()) : [],
                        'images'                 => !empty($product['images']) ? array_map(function ($image) {
                            return [
                                'image_id'              => $image['id'],
                                'alt'                   => $image['alt'],
                                'position'              => $image['position'],
                                'src'                   => $image['src'],
                                'width'                 => $image['width'],
                                'height'                => $image['height'],
                                'admin_graphql_api_id'  => $image['admin_graphql_api_id'],
                                'variant_ids'           => $image['variant_ids']
                            ];
                        }, $product['images']->toArray()) : [],
                        'options'                => !empty($product['options']) ? array_map(function ($option) {
                            return [
                                'option_id'             => $option['id'],
                                'name'                  => $option['name'],
                                'position'              => $option['position'],
                                'values'                => $option['values']
                            ];
                        }, $product['options']->toArray()) : [],
                    ];

                    $batch[] = $data;

                    if (count($batch) >= 100) {
                        ProductUpdateJob::dispatch($batch);
                        $batch = [];
                    }
                }
                $nextPage = $response['link']['next'] ?? null;
            } while ($nextPage);

            if (!empty($batch)) {
                ProductUpdateJob::dispatch($batch);
            }

            Log::info("[LISTENER][PRODUCT] Queue success - {$shopId}");
        } catch (Exception $e) {
            Log::error("[LISTENER][PRODUCT] Queue failed - {$shopId}, Error: {$e->getMessage()}");
        }
    }
}
