<?php

namespace App\Jobs\Setup;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductOption;
use App\Models\ProductVariant;
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
     * Product data
     *
     * @var array
     */
    protected array $data;

    /**
     * Create a new job instance.
     *
     * @param array $data
     */
    public function __construct(array $data)
    {
        $this->data = $data;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle(): void
    {
        $products = $this->isMultiple($this->data) ? $this->data : [$this->data];

        foreach ($products as $product) {
            try {
                if (empty($product['id'])) {
                    Log::error("Product ID is missing - {$product['id']}");
                    continue;
                }

                Product::updateOrCreate(
                    ['product_id' => $product['id']],
                    [
                        'admin_graphql_api_id' => $product['admin_graphql_api_id'],
                        'title'                => $product['title'],
                        'handle'               => $product['handle'],
                        'body_html'            => $product['body_html'],
                        'product_type'         => $product['product_type'],
                        'vendor'               => $product['vendor'],
                        'status'               => $product['status'],
                        'published_scope'      => $product['published_scope'],
                        'tags'                 => $product['tags'],
                        'published_at'         => $product['published_at'],
                        'created_at'           => $product['created_at'],
                        'updated_at'           => $product['updated_at'],
                        'user_id'              => $product['user_id']
                    ]
                );

                ProductVariant::where('product_id', $product['id'])->delete();
                if (!empty($product['variants'])) {
                    foreach ($product['variants'] as $variant) {
                        ProductVariant::updateOrCreate(
                            ['variant_id' => $variant['variant_id']],
                            [
                                'product_id'            => $product['id'],
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
                                'admin_graphql_api_id'  => $variant['admin_graphql_api_id'],
                                'image_id'              => $variant['image_id']
                            ]
                        );
                    }
                    Log::info("[SETUP][PRODUCT] Variants updated - {$product['id']}");
                } else {
                    Log::info("[SETUP][PRODUCT] No variants found - {$product['id']}, all previous variants deleted.");
                }

                ProductImage::where('product_id', $product['id'])->delete();
                if (!empty($product['images'])) {
                    foreach ($product['images'] as $image) {
                        ProductImage::updateOrCreate(
                            ['image_id' => $image['image_id']],
                            [
                                'product_id'           => $product['id'],
                                'alt'                  => $image['alt'],
                                'position'             => $image['position'],
                                'src'                  => $image['src'],
                                'width'                => $image['width'],
                                'height'               => $image['height'],
                                'admin_graphql_api_id' => $image['admin_graphql_api_id'],
                                'variant_ids'          => $image['variant_ids'] ?? []
                            ]
                        );
                    }
                    Log::info("[SETUP][PRODUCT] Images updated - {$product['id']}");
                } else {
                    Log::info("[SETUP][PRODUCT] No images found - {$product['id']}, all previous images deleted.");
                }

                ProductOption::where('product_id', $product['id'])->delete();
                if (!empty($product['options'])) {
                    foreach ($product['options'] as $option) {
                        ProductOption::updateOrCreate(
                            ['option_id' => $option['option_id']],
                            [
                                'product_id'            => $product['id'],
                                'name'                  => $option['name'],
                                'position'              => $option['position'],
                                'values'                => $option['values'] ?? []
                            ]
                        );
                    }
                    Log::info("[SETUP][PRODUCT] Options updated - {$product['id']}");
                } else {
                    Log::info("[SETUP][PRODUCT] No options found - {$product['id']}, all previous options deleted.");
                }

                Log::info("[SETUP][PRODUCT] Update success - {$product['id']}");
            } catch (Exception $e) {
                Log::error("[SETUP][PRODUCT] Update failed - {$product['id']}, Error: {$e->getMessage()}");
            }
        }
    }

    /**
     * Check if the data is multiple.
     *
     * @param array $data
     * @return bool
     */
    protected function isMultiple(array $data): bool
    {
        return isset($data[0]) && is_array($data[0]);
    }
}
