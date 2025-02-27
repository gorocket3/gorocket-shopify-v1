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
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

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

            $totalProducts = count($products);
            $processedProducts = 0;

            foreach ($products as $product) {
                $response = $this->updateProduct($shop, $product);
                if (empty($response['errors'])) {
                    Redis::setex($product['id'], 600, true);
                }
                $this->updateProductDB($shop, $product);

                if(isset($product['variants'])) {
                    foreach ($product['variants'] as $variant) {
                        $this->updateVariant($shop, $variant);
                        $this->updateInventory($shop, $variant);
                        $this->updateVariantDB($variant);
                    }
                }

                $progress = intval((++$processedProducts / $totalProducts) * 100);
                event(new MessageCompleted(
                    $shop->id,
                    'product-update',
                    ['progress' => $progress]
                ));
            }
        } catch (Exception $e) {
            Log::error("[APP][PRODUCT] Update failed - {$shop->id}, Error: {$e->getMessage()}");
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
