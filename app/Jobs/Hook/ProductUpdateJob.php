<?php

namespace App\Jobs\Hook;

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
use Illuminate\Support\Facades\DB;
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
        try {
            DB::transaction(function () {
                $product = Product::updateOrCreate(
                    ['product_id' => $this->data['id']],
                    [
                        'admin_graphql_api_id' => $this->data['admin_graphql_api_id'],
                        'title'                => $this->data['title'],
                        'handle'               => $this->data['handle'],
                        'body_html'            => $this->data['body_html'],
                        'product_type'         => $this->data['product_type'],
                        'vendor'               => $this->data['vendor'],
                        'status'               => $this->data['status'],
                        'published_scope'      => $this->data['published_scope'],
                        'tags'                 => $this->data['tags'],
                        'published_at'         => $this->data['published_at'],
                        'created_at'           => $this->data['created_at'],
                        'updated_at'           => $this->data['updated_at'],
                        'user_id'              => $this->data['user_id']
                    ]
                );
                $productId = $product->product_id;

                $variantIds = [];
                if (!empty($this->data['variants'])) {
                    foreach ($this->data['variants'] as $variant) {
                        $productVariant = ProductVariant::updateOrCreate(
                            ['variant_id' => $variant['id']],
                            [
                                'product_id'               => $productId,
                                'title'                    => $variant['title'],
                                'price'                    => $variant['price'],
                                'position'                 => $variant['position'],
                                'inventory_policy'         => $variant['inventory_policy'],
                                'compare_at_price'         => $variant['compare_at_price'],
                                'option1'                  => $variant['option1'],
                                'option2'                  => $variant['option2'],
                                'option3'                  => $variant['option3'],
                                'created_at'               => $variant['created_at'],
                                'updated_at'               => $variant['updated_at'],
                                'taxable'                  => $variant['taxable'],
                                'barcode'                  => $variant['barcode'],
                                'inventory_item_id'        => $variant['inventory_item_id'],
                                'inventory_quantity'       => $variant['inventory_quantity'],
                                'old_inventory_quantity'   => $variant['old_inventory_quantity'],
                                'admin_graphql_api_id'     => $variant['admin_graphql_api_id'],
                                'image_id'                 => $variant['image_id']
                            ]
                        );
                        $variantIds[] = $productVariant->id;
                    }
                }
                ProductVariant::where('product_id', $productId)->whereNotIn('id', $variantIds)->delete();
                Log::info("[HOOK][PRODUCT] Variants updated - {$this->data['id']}");

                $imageIds = [];
                if (!empty($this->data['images'])) {
                    foreach ($this->data['images'] as $image) {
                        $productImage = ProductImage::updateOrCreate(
                            [
                                'product_id' => $productId,
                                'image_id'   => $image['id']
                            ],
                            [
                                'alt'                  => $image['alt'],
                                'position'             => $image['position'],
                                'src'                  => $image['src'],
                                'width'                => $image['width'],
                                'height'               => $image['height'],
                                'admin_graphql_api_id' => $image['admin_graphql_api_id'],
                                'variant_ids'          => $image['variant_ids'] ?? []
                            ]
                        );
                        $imageIds[] = $productImage->id;
                    }
                }
                ProductImage::where('product_id', $productId)->whereNotIn('id', $imageIds)->delete();
                Log::info("[HOOK][PRODUCT] Images updated - {$this->data['id']}");

                $optionIds = [];
                if (!empty($this->data['options'])) {
                    foreach ($this->data['options'] as $option) {
                        $productOption = ProductOption::updateOrCreate(
                            ['option_id' => $option['id']],
                            [
                                'product_id' => $productId,
                                'name'       => $option['name'],
                                'position'   => $option['position'],
                                'values'     => $option['values'] ?? [],
                            ]
                        );
                        $optionIds[] = $productOption->id;
                    }
                }
                ProductOption::where('product_id', $productId)->whereNotIn('id', $optionIds)->delete();
                Log::info("[HOOK][PRODUCT] Options updated - {$this->data['id']}");
            });
            Log::info("[HOOK][PRODUCT] Update success - {$this->data['id']}");
        } catch (Exception $e) {
            Log::error("[HOOK][PRODUCT] Update failed - {$this->data['id']}, Error: {$e->getMessage()}");
        }
    }
}
