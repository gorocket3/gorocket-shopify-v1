<?php

namespace App\Jobs\Hook;

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
         try {
            Product::updateOrCreate(
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

             if (!empty($this->data['image'])) {
                 ProductImage::updateOrCreate(
                     ['image_id' => $this->data['image']['id']],
                     [
                         'product_id'           => $this->data['id'],
                         'alt'                  => $this->data['image']['alt'],
                         'position'             => $this->data['image']['position'],
                         'src'                  => $this->data['image']['src'],
                         'width'                => $this->data['image']['width'],
                         'height'               => $this->data['image']['height'],
                         'admin_graphql_api_id' => $this->data['image']['admin_graphql_api_id'],
                         'variant_ids'          => $this->data['image']['variant_ids']
                     ]
                 );
             } else {
                 ProductImage::where('product_id',  $this->data['id'])->delete();
                 Log::info("[HOOK][PRODUCT] Image deleted for product - { $this->data['id']}");
             }

             Log::info("[HOOK][PRODUCT] Update success - {$this->data['id']}");
        } catch (Exception $e) {
            Log::error("[HOOK][PRODUCT] Update failed - {$this->data['id']}, Error: {$e->getMessage()}");
        }

    }
}
