<?php

namespace App\Jobs\Hook;

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
            $shopId     = $this->container['user_id'];
            $productId  = $this->container['id'];

            if ($productId) {
                Product::where('product_id', $productId)->delete();
                Log::info("[HOOK][PRODUCT] Delete success - {$productId}");

                $totalProducts = Redis::get("product-delete-total:{$shopId}") ?? 1;
                $redisKey = "product-delete-progress:{$shopId}";
                $deletedCount = Redis::incr($redisKey);

                $progress = intval(($deletedCount / $totalProducts) * 100);
                event(new MessageCompleted(
                    $shopId,
                    'product-delete',
                    ['progress' => $progress]
                ));

                if ($progress >= 100) {
                    Redis::del($redisKey);
                    Redis::del("product-delete-total:{$shopId}");
                }

            } else {
                Log::warning("[HOOK][PRODUCT] Id is missing - {$productId}");
            }
        } catch (Exception $e) {
            Log::error("[HOOK][PRODUCT] Delete failed - {$productId}, Error: {$e->getMessage()}");
        }
    }
}
