<?php

namespace App\Jobs;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Exception;

class HandleProductUpdateJob implements ShouldQueue
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
                    ]
                );

                Log::info("Product updated or created successfully - ID: {$product['id']}");
            } catch (Exception $e) {
                Log::error("Failed to update or create product - ID: {$product['id']}, Error: {$e->getMessage()}");
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
