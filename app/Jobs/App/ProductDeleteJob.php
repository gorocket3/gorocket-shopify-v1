<?php

namespace App\Jobs\App;

use App\Events\MessageCompleted;
use App\Models\Product;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

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
            $shop = $this->container['shop'];
            $productIds = $this->container['product_ids'];

            $totalProducts = count($productIds);
            $processedProducts = 0;

            foreach ($productIds as $productId) {
                $response = $shop->api()->rest('DELETE', "/admin/api/" . env('SHOPIFY_API_VERSION') . "/products/{$productId}.json");
                if (empty($response['errors'])) {
                    Redis::setex($productId, 600, true);
                }
                Product::where('product_id', $productId)->delete();

                $progress = intval((++$processedProducts / $totalProducts) * 100);
                event(new MessageCompleted(
                    $shop->id,
                    'product-delete',
                    ['progress' => $progress]
                ));
            }
        } catch (Exception $e) {
            Log::error("[APP][PRODUCT] Delete failed - {$shop->id}, Error: {$e->getMessage()}");
        }
    }
}
