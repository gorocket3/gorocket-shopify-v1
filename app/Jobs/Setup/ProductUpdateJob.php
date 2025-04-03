<?php

namespace App\Jobs\Setup;

use App\Events\MessageCompleted;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductOption;
use App\Models\ProductVariant;
use Carbon\Carbon;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

class ProductUpdateJob implements ShouldQueue
{
    /**
     * InteractsWithQueue, Queueable, SerializesModels
     */
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Product data from webhook
     *
     * @var array
     */
    protected array $data;
    protected int $shopId;
    protected int $progress;

    /**
     * Create a new job instance.
     *
     * @param array $data
     * @param int $shopId
     * @param int $progress
     */
    public function __construct(array $data, int $shopId, int $progress)
    {
        $this->data     = $data;
        $this->shopId   = $shopId;
        $this->progress = $progress;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            DB::transaction(function () {
                $this->bulkUpdateProducts();
                $this->bulkUpdateVariants();
                $this->bulkUpdateImages();
                $this->bulkUpdateOptions();
            });

            Log::info("[SETUP][PRODUCT] Sync completed - {$this->shopId}");
        } catch (Exception $e) {
            Log::error("[SETUP][PRODUCT] Sync failed - {$this->shopId}, Error: {$e->getMessage()}");
        } finally {
            event(new MessageCompleted(
                $this->shopId,
                'product-sync',
                ['progress' => $this->progress]
            ));

            if ($this->progress === 100) {
                Redis::del("shop:{$this->shopId}:product_sync");
            } else {
                Redis::hset("shop:{$this->shopId}:product_sync", 'progress', $this->progress);
            }
        }
    }

    /**
     * Bulk update products
     */
    protected function bulkUpdateProducts(): void
    {
        $products = collect($this->data)->map(fn($product) => [
            'product_id'           => $product['id'],
            'title'                => $product['title'],
            'handle'               => $product['handle'],
            'body_html'            => $product['body_html'],
            'body_text'            => strip_tags($product['body_html'] ?? ''),
            'product_type'         => $product['product_type'],
            'vendor'               => $product['vendor'],
            'status'               => $product['status'],
            'published_scope'      => $product['published_scope'],
            'tags'                 => $product['tags'],
            'user_id'              => $product['user_id'],
            'published_at'         => Carbon::parse($product['published_at'])->setTimezone('UTC'),
            'created_at'           => Carbon::parse($product['created_at'])->setTimezone('UTC'),
            'updated_at'           => Carbon::parse($product['updated_at'])->setTimezone('UTC')
        ]);

        Product::upsert($products->toArray(), ['product_id']);
    }

    /**
     * Bulk update variants
     */
    protected function bulkUpdateVariants(): void
    {
        $variants = collect($this->data)->flatMap(fn($product) => collect($product['variants'] ?? [])->map(fn($variant) => [
            'variant_id'           => $variant['variant_id'],
            'product_id'           => $product['id'],
            'title'                => $variant['title'],
            'price'                => $variant['price'],
            'position'             => $variant['position'],
            'inventory_policy'     => $variant['inventory_policy'],
            'compare_at_price'     => $variant['compare_at_price'] ?? '0.00',
            'option1'              => $variant['option1'],
            'option2'              => $variant['option2'],
            'option3'              => $variant['option3'],
            'taxable'              => $variant['taxable'],
            'barcode'              => $variant['barcode'],
            'fulfillment_service'  => $variant['fulfillment_service'],
            'grams'                => $variant['grams'],
            'inventory_management' => $variant['inventory_management'],
            'requires_shipping'    => $variant['requires_shipping'],
            'sku'                  => $variant['sku'],
            'weight'               => $variant['weight'],
            'weight_unit'          => $variant['weight_unit'],
            'inventory_item_id'    => $variant['inventory_item_id'],
            'inventory_quantity'   => $variant['inventory_quantity'],
            'old_inventory_quantity' => $variant['old_inventory_quantity'],
            'image_id'             => $variant['image_id'],
            'created_at'           => Carbon::parse($product['created_at'])->setTimezone('UTC'),
            'updated_at'           => Carbon::parse($product['updated_at'])->setTimezone('UTC'),
        ]));

        $variants->chunk(300)->each(function ($chunk) {
            ProductVariant::upsert($chunk->toArray(), ['variant_id']);
        });
    }

    /**
     * Bulk update images
     */
    protected function bulkUpdateImages(): void
    {
        $images = collect($this->data)->flatMap(fn($product) => collect($product['images'] ?? [])->map(fn($image) => [
            'product_id'           => $product['id'],
            'image_id'             => $image['image_id'],
            'alt'                  => $image['alt'],
            'position'             => $image['position'],
            'src'                  => $image['src'],
            'width'                => $image['width'],
            'height'               => $image['height'],
            'admin_graphql_api_id' => $image['admin_graphql_api_id'],
            'variant_ids'          => json_encode($image['variant_ids'] ?? []),
            'created_at'           => Carbon::parse($product['created_at'])->setTimezone('UTC'),
            'updated_at'           => Carbon::parse($product['updated_at'])->setTimezone('UTC')
        ]));

        $images->chunk(300)->each(function ($chunk) {
            ProductImage::upsert($chunk->toArray(), ['image_id']);
        });
    }

    /**
     * Bulk update options
     */
    protected function bulkUpdateOptions(): void
    {
        $options = collect($this->data)->flatMap(fn($product) => collect($product['options'] ?? [])->map(fn($option) => [
            'option_id'  => $option['option_id'],
            'product_id' => $product['id'],
            'name'       => $option['name'],
            'position'   => $option['position'],
            'values'     => json_encode($option['values'] ?? []),
            'created_at' => Carbon::parse($product['created_at'])->setTimezone('UTC'),
            'updated_at' => Carbon::parse($product['updated_at'])->setTimezone('UTC')
        ]));

        $options->chunk(300)->each(function ($chunk) {
            ProductOption::upsert($chunk->toArray(), ['option_id']);
        });
    }
}
