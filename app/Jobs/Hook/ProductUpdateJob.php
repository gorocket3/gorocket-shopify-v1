<?php

namespace App\Jobs\Hook;

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
     */
    public function handle(): void
    {
        try {
            DB::transaction(function () {
                $this->updateProduct();
                $this->updateVariants();
                $this->updateImages();
                $this->updateOptions();
                $this->deleteMissingRecords();
            });
            Log::info("[HOOK][PRODUCT] Update success - {$this->data['id']}");
        } catch (Exception $e) {
            Log::error("[HOOK][PRODUCT] Update failed - {$this->data['id']}, Error: {$e->getMessage()}");
        }
    }

    /**
     * Update product
     */
    protected function updateProduct(): void
    {
        Product::updateOrCreate(
            ['product_id' => $this->data['id']],
            [
                'title'                => $this->data['title'],
                'handle'               => $this->data['handle'],
                'body_html'            => $this->data['body_html'],
                'product_type'         => $this->data['product_type'],
                'vendor'               => $this->data['vendor'],
                'status'               => $this->data['status'],
                'published_scope'      => $this->data['published_scope'],
                'tags'                 => $this->data['tags'],
                'user_id'              => $this->data['user_id'],
                'published_at'         => Carbon::parse($this->data['published_at'])->setTimezone('UTC'),
                'created_at'           => Carbon::parse($this->data['created_at'])->setTimezone('UTC'),
                'updated_at'           => Carbon::parse($this->data['updated_at'])->setTimezone('UTC')
            ]
        );
    }

    /**
     * Update variants
     */
    protected function updateVariants(): void
    {
        foreach ($this->data['variants'] ?? [] as $variant) {
            ProductVariant::updateOrCreate(
                ['variant_id' => $variant['id']],
                [
                    'product_id'             => $this->data['id'],
                    'title'                  => $variant['title'],
                    'price'                  => $variant['price'],
                    'position'               => $variant['position'],
                    'inventory_policy'       => $variant['inventory_policy'],
                    'compare_at_price'       => $variant['compare_at_price'],
                    'option1'                => $variant['option1'],
                    'option2'                => $variant['option2'],
                    'option3'                => $variant['option3'],
                    'taxable'                => $variant['taxable'],
                    'barcode'                => $variant['barcode'],
                    'inventory_item_id'      => $variant['inventory_item_id'],
                    'inventory_quantity'     => $variant['inventory_quantity'],
                    'old_inventory_quantity' => $variant['old_inventory_quantity'],
                    'image_id'               => $variant['image_id'],
                    'created_at'             => Carbon::parse($this->data['created_at'])->setTimezone('UTC'),
                    'updated_at'             => Carbon::parse($this->data['updated_at'])->setTimezone('UTC')
                ]
            );
        }
    }

    /**
     * Update images
     */
    protected function updateImages(): void
    {
        foreach ($this->data['images'] ?? [] as $image) {
            ProductImage::updateOrCreate(
                ['product_id' => $this->data['id'], 'image_id' => $image['id']],
                [
                    'alt'                  => $image['alt'],
                    'position'             => $image['position'],
                    'src'                  => $image['src'],
                    'width'                => $image['width'],
                    'height'               => $image['height'],
                    'admin_graphql_api_id' => $image['admin_graphql_api_id'],
                    'variant_ids'          => $image['variant_ids'] ?? [],
                    'created_at'           => Carbon::parse($this->data['created_at'])->setTimezone('UTC'),
                    'updated_at'           => Carbon::parse($this->data['updated_at'])->setTimezone('UTC')
                ]
            );
        }
    }

    /**
     * Update options
     */
    protected function updateOptions(): void
    {
        foreach ($this->data['options'] ?? [] as $option) {
            ProductOption::updateOrCreate(
                ['option_id' => $option['id']],
                [
                    'product_id' => $this->data['id'],
                    'name'       => $option['name'],
                    'position'   => $option['position'],
                    'values'     => $option['values'] ?? [],
                    'created_at' => Carbon::parse($this->data['created_at'])->setTimezone('UTC'),
                    'updated_at' => Carbon::parse($this->data['updated_at'])->setTimezone('UTC')
                ]
            );
        }
    }

    /**
     * Delete missing records
     */
    protected function deleteMissingRecords(): void
    {
        $currentVariantIds = collect($this->data['variants'] ?? [])->pluck('id');
        ProductVariant::where('product_id', $this->data['id'])->whereNotIn('variant_id', $currentVariantIds)->delete();

        $currentImageIds = collect($this->data['images'] ?? [])->pluck('id');
        ProductImage::where('product_id', $this->data['id'])->whereNotIn('image_id', $currentImageIds)->delete();

        $currentOptionIds = collect($this->data['options'] ?? [])->pluck('id');
        ProductOption::where('product_id', $this->data['id'])->whereNotIn('option_id', $currentOptionIds)->delete();
    }
}
