<?php

namespace App\Listeners;

use App\Events\MessageCompleted;
use App\Jobs\Setup\ProductUpdateJob;
use App\Models\Product;
use App\Models\User;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
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
            $chunk = 250;

            if (!$shop) {
                Log::error("[LISTENER][PRODUCT] Shop not found - {$shopId}");
                return;
            }

            $totalProductsQuery = <<<GRAPHQL
            {
                productsCount {
                    count
                }
            }
            GRAPHQL;

            $totalResponse = $shop->api()->graph($totalProductsQuery);
            $totalProducts = $totalResponse['body']['data']['productsCount']['count'] ?? 0;
            if($totalProducts > 0) {
                Redis::hset("shop:{$shopId}:product_sync", 'syncing', true);
                Redis::hset("shop:{$shopId}:product_sync", 'progress', 0);
                Redis::hset("shop:{$shopId}:product_sync", 'bulking', 0);
                Redis::expire("shop:{$shopId}:product_sync", 1800);
            } else {
                event(new MessageCompleted(
                    $shopId,
                    'product-sync',
                    ['progress' => 100]
                ));
                return;
            }

            $processedProducts = 0;
            $batch = [];
            $nextPage = null;

            $this->deleteDBProducts($shopId, $chunk);

            do {
                $response = $shop->api()->rest('GET', '/admin/api/' . env('SHOPIFY_API_VERSION') . '/products.json', [
                    'limit' => $chunk,
                    'page_info' => $nextPage,
                ], [
                    'timeout' => 30,
                    'connect_timeout' => 10
                ]);

                if (($response['errors'] ?? false) || !isset($response['body']['products'])) {
                    Log::error("[LISTENER][PRODUCT] API failed - {$shopId}");
                    Redis::del("shop:{$shopId}:product_sync");
                    return;
                }

                $products = $response['body']['products'];
                foreach ($products as $product) {
                    $data = [
                        'id'                     => $product['id'],
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
                                'barcode'               => $variant['barcode'] === '' ? null : $variant['barcode'],
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
                                'image_id'              => $variant['image_id']
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
                    $processedProducts++;
                    $progress = min(100, round(($processedProducts / $totalProducts) * 100));

                    if (count($batch) >= $chunk) {
                        ProductUpdateJob::dispatch($batch, $shopId, $progress);
                        $batch = [];
                    }
                }
                $nextPage = $response['link']['next'] ?? null;
            } while ($nextPage);

            if (!empty($batch)) {
                ProductUpdateJob::dispatch($batch, $shopId, 100);
            }
            Log::info("[LISTENER][PRODUCT] Queue success - {$shopId}");

            $this->runBulkProductGraphQL($shop, $chunk, $totalProducts);

        } catch (Exception $e) {
            Log::error("[LISTENER][PRODUCT] Queue failed - {$shopId}, Error: {$e->getMessage()}");
            Redis::del("shop:{$shopId}:product_sync");
        }
    }

    /**
     * Delete all local products for the shop in chunks.
     *
     * @param int $shopId
     * @param int $chunk
     * @return void
     */
    private function deleteDBProducts(int $shopId, int $chunk = 250): void
    {
        DB::statement('SET @DISABLE_PRODUCT_DELETE_TRIGGER = TRUE');

        do {
            $deleted = Product::where('user_id', $shopId)->orderBy('id')->limit($chunk)->delete();
        } while ($deleted > 0);

        DB::statement('SET @DISABLE_PRODUCT_DELETE_TRIGGER = NULL');

    }

    /**
     * Run bulk product GraphQL query to fetch all products.
     *
     * @param User $shop
     * @param int $chunk
     * @param int $totalProducts
     * @return void
     */
    private function runBulkProductGraphQL(User $shop, int $chunk, int $totalProducts): void
    {
        $bulkQuery = <<<GRAPHQL
        mutation {
            bulkOperationRunQuery(
                query: """
                {
                    products {
                        edges {
                            node {
                                id
                                productCategory {
                                    productTaxonomyNode {
                                        id
                                        name
                                        fullName
                                    }
                                }
                                seo {
                                    title
                                    description
                                }
                                featuredMedia {
                                    preview {
                                        image {
                                            src
                                        }
                                    }
                                }
                                collections(first: 50) {
                                    edges {
                                        node {
                                            id
                                            title
                                            handle
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                """
            ) {
                bulkOperation {
                    id
                    status
                }
                userErrors {
                    field
                    message
                }
            }
        }
        GRAPHQL;

        sleep($totalProducts <= $chunk ? 2 : ($totalProducts <= $chunk * 2 ? 1 : 0));

        $response = $shop->api()->graph($bulkQuery);
        $errors = $response['body']['data']['errors'] ?? [];
        if ($errors) {
            Log::error("[LISTENER][BULK] Bulk failed - {$shop->id}");
        } else {
            Redis::hset("shop:{$shop->id}:product_sync", 'bulking', true);
            Log::info("[LISTENER][BULK] Bulk initiated - {$shop->id}");
        }
    }
}
