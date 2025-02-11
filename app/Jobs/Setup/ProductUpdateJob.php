<?php

namespace App\Jobs\Setup;

use App\Models\Product;
use App\Models\ProductImage;
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
                    Log::info("[SETUP][PRODUCT] Images updated for product - {$product['id']}");
                } else {
                    Log::info("[SETUP][PRODUCT] No images found for product - {$product['id']}, all previous images deleted.");
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
