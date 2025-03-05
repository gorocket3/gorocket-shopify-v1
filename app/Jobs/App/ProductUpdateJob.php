<?php

namespace App\Jobs\App;

use App\Events\MessageCompleted;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProductUpdateJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Product data from webhook
     *
     * @var array
     */
    protected array $container;

    /**
     * Create a new job instance.
     *
     * @param array $container
     */
    public function __construct(array $container)
    {
        $this->container = $container;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle(): void
    {
        try {
            $shop = $this->container['shop'];
            $products = $this->container['products'];

//            foreach ($products as $product) {
//                Redis::setex($product['id'], 60, true);
//                //$this->updateProductDB($shop, $product);
//
//                if(isset($product['variants'])) {
//                    foreach ($product['variants'] as $variant) {
//                        //$this->updateVariant($shop, $variant);
//                        //$this->updateInventory($shop, $variant);
//                        //$this->updateVariantDB($variant);
//                    }
//                }
//            }

            $this->updateProducts($shop, $products);


        } catch (Exception $e) {
            Log::error("[APP][PRODUCT] Update failed - {$shop->id}, Error: {$e->getMessage()}");
        }
    }

    /**
     * Bulk update products
     *
     * @param User $shop
     * @param array $products
     *
     * @return void
     */
    private function updateProducts(User $shop, array $products): void
    {
        $totalProducts = count($products);
        $chunks = array_chunk($products, 10);
        $processed = 0;

        foreach ($chunks as $chunk) {
            $mutations = [];
            $productData = [];

            foreach ($chunk as $product) {
                $mutationName = "updateProduct" . $product['id'];
                $mutations[] = sprintf(
                    '%s: productUpdate(input: {
                id: "gid://shopify/Product/%s",
                title: "%s",
                status: %s,
                descriptionHtml: "%s",
                tags: "%s"
                productType: "%s"
                vendor: "%s"
                handle: "%s"
            }) {
                product {
                    id
                    title
                    status
                    descriptionHtml
                    tags
                    productType
                    vendor
                    handle
                }
                userErrors {
                    field
                    message
                }
            }',
                    $mutationName,
                    $product['id'],
                    addslashes($product['title'] ?? ''),
                    strtoupper($product['status']),
                    addslashes($product['body_html'] ?? ''),
                    addslashes($product['tags'] ?? ''),
                    addslashes($product['product_type'] ?? ''),
                    addslashes($product['vendor'] ?? ''),
                    addslashes($product['handle'] ?? '')
                );

                $productData[] = [
                    'shop_id' => $shop->id,
                    'product_id' => $product['id'],
                    'title' => $product['title'] ?? '',
                    'status' => $product['status'],
                    'description' => $product['body_html'] ?? '',
                    'tags' => $product['tags'] ?? '',
                    'product_type' => $product['product_type'] ?? '',
                    'vendor' => $product['vendor'] ?? '',
                    'handle' => $product['handle'] ?? '',
                    'updated_at' => now()
                ];
            }

            $query = sprintf('mutation {%s}', implode("\n", $mutations));
            $response = $shop->api()->graph($query);
            if (!empty($response['errors']) || !empty($response['data']['userErrors'])) {
                Log::error("[APP][PRODUCT] Bulk Product Update Failed: " . json_encode($response));
            } else {
                $this->updateProductsDB($productData);
            }

            $processed += count($chunk);
            $progress = min(100, round(($processed / $totalProducts) * 100));
            event(new MessageCompleted(
                $shop->id,
                'product-update',
                ['progress' => $progress]
            ));
            usleep(1000);
        }
    }

    /**
     * Update products in database
     *
     * @param array $products
     * @return void
     */
    private function updateProductsDB(array $products): void
    {
        try {
            foreach ($products as $product) {
                $updateData = collect($product)
                    ->only(['title', 'status', 'body_html', 'tags', 'product_type', 'vendor', 'handle'])
                    ->filter()
                    ->toArray();

                if (!empty($updateData)) {
                    $updateData['updated_at'] = now();
                    $updated = Product::where('product_id', $product['product_id'])
                        ->where('user_id', $product['shop_id'])
                        ->update($updateData);

                    if (!$updated) {
                        Log::warning("[APP][PRODUCT] No matching product found for update - Product ID: {$product['product_id']}");
                    }
                }
            }
        } catch (Exception $e) {
            Log::error("[APP][PRODUCT] Bulk product update failed - Error: {$e->getMessage()}");
        }
    }



















    /**
     * Update product variant
     *
     * @param User $shop
     * @param array $product
     *
     * @return array
     */
    private function updateProduct(User $shop, array $product): array
    {
        $payload = ['product' => ['id' => $product['id']]];
        if (isset($product['title'])) {
            $payload['product']['title'] = $product['title'];
        }
        if (isset($product['status'])) {
            $payload['product']['status'] = $product['status'];
        }
        if (isset($product['body_html'])) {
            $payload['product']['body_html'] = $product['body_html'];
        }
        if (isset($product['tags'])) {
            $payload['product']['tags'] = $product['tags'];
        }

        return $shop->api()->rest('PUT', '/admin/api/' . env('SHOPIFY_API_VERSION') . '/products/' . $product['id'] . '.json', $payload);
    }

    /**
     * Update product in database
     *
     * @param User $shop
     * @param array $product
     *
     * @return void
     */
    private function updateProductDB(User $shop, array $product): void
    {
        try {
            if (isset($product['title'])) {
                $updateData['title'] = $product['title'];
            }
            if (isset($product['status'])) {
                $updateData['status'] = $product['status'];
            }
            if (isset($product['body_html'])) {
                $updateData['body_html'] = $product['body_html'];
            }
            if (isset($product['tags'])) {
                $updateData['tags'] = $product['tags'];
            }
            $updateData['updated_at'] = now();

            Product::where('product_id', $product['id'])
                ->where('user_id', $shop->id)
                ->update($updateData);

        } catch (Exception $e) {
            Log::error("[APP][PRODUCT] Product update failed - Product ID: {$product['id']}, Error: {$e->getMessage()}");
        }
    }

    /**
     * Update product variant
     *
     * @param User $shop
     * @param array $variant
     *
     * @return void
     */
    private function updateVariant(User $shop, array $variant): void
    {
        $payload = ['variant' => ['id' => $variant['id']]];
        if (isset($variant['price'])) {
            $payload['variant']['price'] = $variant['price'];
        }
        if (isset($variant['compare_at_price'])) {
            $payload['variant']['compare_at_price'] = $variant['compare_at_price'];
        }
        if (isset($variant['weight'])) {
            $payload['variant']['weight'] = (float) $variant['weight'];
        }
        if (isset($variant['weight_unit'])) {
            $payload['variant']['weight_unit'] = $variant['weight_unit'];
        }
        if (isset($variant['sku'])) {
            $payload['variant']['sku'] = $variant['sku'];
        }
        if (isset($variant['inventory_policy'])) {
            $payload['variant']['inventory_policy'] = $variant['inventory_policy'];
        }
        if (isset($variant['taxable'])) {
            $payload['variant']['taxable'] = $variant['taxable'];
        }
        if (isset($variant['barcode'])) {
            $payload['variant']['barcode'] = $variant['barcode'];
        }

        $shop->api()->rest('PUT', '/admin/api/' . env('SHOPIFY_API_VERSION') . '/variants/' . $variant['id'] . '.json', $payload);
    }

    /**
     * Update variant in database
     *
     * @param array $variant
     *
     * @return void
     */
    private function updateVariantDB(array $variant): void
    {
        try {
            if (isset($variant['product_id'])) {
                $updateData['product_id'] = $variant['product_id'];
            }
            if (isset($variant['price'])) {
                $updateData['price'] = $variant['price'];
            }
            if (isset($variant['compare_at_price'])) {
                $updateData['compare_at_price'] = $variant['compare_at_price'];
            }
            if (isset($variant['inventory_quantity'])) {
                $updateData['inventory_quantity'] = $variant['inventory_quantity'];
            }
            if (isset($variant['weight'])) {
                $updateData['weight'] = $variant['weight'];
            }
            if (isset($variant['weight_unit'])) {
                $updateData['weight_unit'] = $variant['weight_unit'];
            }
            if (isset($variant['sku'])) {
                $updateData['sku'] = $variant['sku'];
            }
            if (isset($variant['inventory_policy'])) {
                $updateData['inventory_policy'] = $variant['inventory_policy'];
            }
            if (isset($variant['taxable'])) {
                $updateData['taxable'] = $variant['taxable'];
            }
            if (isset($variant['barcode'])) {
                $updateData['barcode'] = $variant['barcode'];
            }
            if (isset($variant['requires_shipping'])) {
                $updateData['requires_shipping'] = $variant['requires_shipping'];
            }
            $updateData['updated_at'] = now();

            ProductVariant::updateOrCreate(
                ['variant_id' => $variant['id']],
                $updateData
            );
        } catch (Exception $e) {
            Log::error("[APP][VARIANT] Variant update failed - Variant ID: {$variant['id']}, Error: {$e->getMessage()}");
        }
    }

    /**
     * Update inventory
     *
     * @param User $shop
     * @param array $variant
     *
     * @return void
     */
    private function updateInventory(User $shop, array $variant): void
    {
        if (isset($variant['inventory_item_id']) && isset($variant['inventory_quantity'])) {
            $locationResponse = $shop->api()->rest('GET', '/admin/api/' . env('SHOPIFY_API_VERSION') . '/inventory_levels.json', ['inventory_item_ids' => $variant['inventory_item_id']]);
            $locationId =  $locationResponse['body']['inventory_levels'][0]['location_id'] ?? null;

            if ($locationId) {
                $payload = [
                    'location_id' => $locationId,
                    'inventory_item_id' => $variant['inventory_item_id'],
                    'available' => (int) $variant['inventory_quantity']
                ];

                $shop->api()->rest('POST', '/admin/api/' . env('SHOPIFY_API_VERSION') . '/inventory_levels/set.json', $payload);
            }
        }
    }
}
