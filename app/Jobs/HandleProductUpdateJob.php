<?php
namespace App\Jobs;

use App\Models\Product;
use Carbon\Carbon;
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
            Product::updateOrCreate(
                ['product_id' => $this->container['id']],
                [
                    'admin_graphql_api_id' => $this->container['admin_graphql_api_id'],
                    'title' => $this->container['title'],
                    'handle' => $this->container['handle'],
                    'body_html' => $this->container['body_html'],
                    'product_type' => $this->container['product_type'],
                    'vendor' => $this->container['vendor'],
                    'status' => $this->container['status'],
                    'published_scope' => $this->container['published_scope'],
                    'tags' => $this->container['tags'],
                    'published_at' => Carbon::parse($this->container['published_at'])->timezone('UTC')->format('Y-m-d H:i:s'),
                    'created_at' => Carbon::parse($this->container['created_at'])->timezone('UTC')->format('Y-m-d H:i:s'),
                    'updated_at' => Carbon::parse($this->container['updated_at'])->timezone('UTC')->format('Y-m-d H:i:s')
                ]
            );

            Log::info("Product updated or created successfully - ID: {$this->container['id']}");
        } catch (Exception $e) {
            Log::error("Failed to update or create product - ID: {$this->container['id']}, Error: {$e->getMessage()}");
        }
    }
}
