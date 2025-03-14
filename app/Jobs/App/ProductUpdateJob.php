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
            $progress = $this->container['progress'];

            $this->updateProducts($shop, $products, $progress);
        } catch (Exception $e) {
            Log::error("[APP][PRODUCT] Update failed - {$shop->id}, Error: {$e->getMessage()}");
        }
    }

    /**
     * Bulk update products
     *
     * @param User $shop
     * @param array $products
     * @param int $progress
     *
     * @return void
     */
    private function updateProducts(User $shop, array $products, int $progress): void
    {
        $variants = [];
        $mutations = [];
        $productData = [];

        foreach ($products as $product) {
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
                'body_html' => $product['body_html'] ?? '',
                'tags' => $product['tags'] ?? '',
                'product_type' => $product['product_type'] ?? '',
                'vendor' => $product['vendor'] ?? '',
                'handle' => $product['handle'] ?? '',
                'updated_at' => now()
            ];

            if (!empty($product['variants']) && is_array($product['variants'])) {
                foreach ($product['variants'] as $variant) {
                    $variant['product_id'] = $product['id'];
                    $variants[] = $variant;
                }
            }
        }

        $query = sprintf('mutation {%s}', implode("\n", $mutations));
        $response = $shop->api()->graph($query);
        if (!empty($response['errors']) || !empty($response['data']['userErrors'])) {
            Log::error("[APP][PRODUCT] Bulk Product Update Failed: " . json_encode($response));
        } else {
            $this->updateProductsDB($productData);
        }

        if (!empty($variants)) {
            $this->updateVariants($shop, $variants);
        }

        event(new MessageCompleted(
            $shop->id,
            'product-update',
            ['progress' => $progress]
        ));
        usleep(1000);
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
            $updateData = collect($products)->map(function ($product) {
                return [
                    'user_id' => $product['shop_id'],
                    'product_id' => $product['product_id'],
                    'title' => $product['title'] ?? '',
                    'status' => $product['status'],
                    'body_html' => $product['body_html'] ?? '',
                    'tags' => $product['tags'] ?? '',
                    'product_type' => $product['product_type'] ?? '',
                    'vendor' => $product['vendor'] ?? '',
                    'handle' => $product['handle'] ?? '',
                    'updated_at' => now()
                ];
            })->toArray();

            Product::upsert($updateData, ['product_id', 'user_id']);

        } catch (Exception $e) {
            Log::error("[APP][PRODUCT] Bulk product update failed - Error: {$e->getMessage()}");
        }
    }

    /**
     * Bulk update product variants using GraphQL
     *
     * @param User $shop
     * @param array $variants
     *
     * @return void
     */
    private function updateVariants(User $shop, array $variants): void
    {
        $chunks = array_chunk($variants, 10);

        foreach ($chunks as $chunk) {
            $variantsData = [];
            $variantDataDB = [];
            $productId = null;

            foreach ($chunk as $variant) {
                $productId = "gid://shopify/Product/{$variant['product_id']}";

                $unitMapping = ['g'  => 'GRAMS', 'kg' => 'KILOGRAMS', 'lb' => 'POUNDS', 'oz' => 'OUNCES'];
                $inputUnit = strtolower($variant['weight_unit'] ?? 'kg');
                $weightUnit = $unitMapping[$inputUnit] ?? 'KILOGRAMS';

                $variantsData[] = sprintf(
                    '{
                    id: "gid://shopify/ProductVariant/%s",
                    price: "%s",
                    compareAtPrice: "%s",
                    barcode: "%s",
                    taxable: %s,
                    inventoryPolicy: %s,
                    inventoryItem: {
                        sku: "%s",
                        requiresShipping: %s,
                        measurement: {
                            weight: {
                                value: %s,
                                unit: %s
                            }
                        }
                    }
                }',
                    $variant['id'],
                    $variant['price'] ?? '0.00',
                    $variant['compare_at_price'] ?? '0.00',
                    addslashes($variant['barcode'] ?? ''),
                    $variant['taxable'] ? 'true' : 'false',
                    strtoupper($variant['inventory_policy'] ?? 'DENY'),
                    addslashes($variant['sku'] ?? ''),
                    $variant['requires_shipping'] ? 'true' : 'false',
                    isset($variant['weight']) ? (float)$variant['weight'] : 0.0,
                    $weightUnit
                );

                $variantDataDB[] = [
                    'variant_id' => $variant['id'],
                    'product_id' => $variant['product_id'],
                    'price' => $variant['price'] ?? '0.00',
                    'compare_at_price' => $variant['compare_at_price'] ?? '0.00',
                    'sku' => $variant['sku'] ?? '',
                    'requires_shipping' => $variant['requires_shipping'] ? 1 : 0,
                    'inventory_item_id' => $variant['inventory_item_id'],
                    'inventory_policy' => $variant['inventory_policy'],
                    'inventory_management' => $variant['inventory_management'] === true ? 'shopify' : null,
                    'inventory_quantity' => $variant['inventory_quantity'] ?? 0,
                    'taxable' => $variant['taxable'] ? 1 : 0,
                    'barcode' => $variant['barcode'] ?? '',
                    'weight' => $variant['weight'] ?? 0,
                    'weight_unit' => $inputUnit,
                    'updated_at' => now()
                ];
            }

            $query = sprintf(
                'mutation {
                productVariantsBulkUpdate(
                    productId: "%s",
                    variants: [%s]
                ) {
                    product {
                        id
                    }
                    productVariants {
                        id
                        price
                        compareAtPrice
                        barcode
                        inventoryItem {
                            sku
                            requiresShipping
                            measurement {
                                weight {
                                    value
                                    unit
                                }
                            }
                        }
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }',
                $productId,
                implode(", ", $variantsData)
            );

            $response = $shop->api()->graph($query);
            if (!empty($response['errors']) || !empty($response['data']['userErrors'])) {
                Log::error("[APP][VARIANT] Bulk Variant Update Failed: " . json_encode($response));
            } else {
                $this->updateVariantsDB($variantDataDB);
            }

            foreach ($chunk as $variant) {
                $this->updateInventoryQuantity($shop, $variant);
            }
        }
    }

    /**
     * Bulk update variants in database
     *
     * @param array $variants
     * @return void
     */
    private function updateVariantsDB(array $variants): void
    {
        try {
            ProductVariant::upsert($variants, ['variant_id']);
        } catch (Exception $e) {
            Log::error("[APP][VARIANT] Bulk variant update failed - Error: {$e->getMessage()}");
        }
    }

    /**
     * Update inventory quantity
     *
     * @param User $shop
     * @param array $variant
     *
     * @return void
     */
    private function updateInventoryQuantity(User $shop, array $variant): void
    {
        if (!isset($variant['inventory_item_id'], $variant['inventory_quantity']) || empty($variant['inventory_management'])) {
            return;
        }

        $locationResponse = $shop->api()->rest(
            'GET',
            '/admin/api/' . env('SHOPIFY_API_VERSION') . '/inventory_levels.json',
            ['inventory_item_ids' => $variant['inventory_item_id']]
        );

        $locationId = $locationResponse['body']['inventory_levels'][0]['location_id'] ?? null;
        if ($locationId) {
            $payload = [
                'location_id' => $locationId,
                'inventory_item_id' => $variant['inventory_item_id'],
                'available' => (int) $variant['inventory_quantity']
            ];

            $response = $shop->api()->rest(
                'POST',
                '/admin/api/' . env('SHOPIFY_API_VERSION') . '/inventory_levels/set.json',
                $payload
            );

            if ($response['errors'] ?? false) {
                Log::error("[APP][INVENTORY] Inventory Update Failed: " . json_encode($response));
            }
        }
    }
}
