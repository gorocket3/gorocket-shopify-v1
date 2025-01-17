<?php

namespace App\Jobs\Hook;

use App\Models\Product;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProductDeleteJob implements ShouldQueue
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
            $productId = $this->container['id'] ?? null;

            if ($productId) {
                Product::where('product_id', $productId)->delete();
                Log::info("Product deleted - {$productId}");
            } else {
                Log::warning("Product ID is missing - {$productId}");
            }
        } catch (Exception $e) {
            Log::error("Product delete failed - {$e->getMessage()}");
        }
    }
}
