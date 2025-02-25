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
            $shopId = $shop->id;
            $productIds = $this->container['product_ids'];

            $totalKey = "product-delete-total:{$shopId}";
            $progressKey = "product-delete-progress:{$shopId}";

            if (!Redis::exists($totalKey)) {
                Redis::set($totalKey, count($productIds));
                Redis::set($progressKey, 0);
            }

            foreach ($productIds as $productId) {
                if ($this->deleteProductFromShopify($shop, $productId)) {
                    Product::where('product_id', $productId)->delete();
                    Redis::setex($productId, 600, true);
                }

                $this->updateProgress($shopId, $totalKey, $progressKey);
            }
        } catch (Exception $e) {
            Log::error("[APP][PRODUCT] Delete failed - {$shop->id}, Error: {$e->getMessage()}");
        }
    }

    /**
     * Delete product from Shopify
     *
     * @param object $shop
     * @param int $productId
     * @return bool 성공 여부
     */
    private function deleteProductFromShopify(object $shop, int $productId): bool
    {
        $response = $shop->api()->rest('DELETE', "/admin/api/" . env('SHOPIFY_API_VERSION') . "/products/{$productId}.json");

        if (isset($response['errors']) && $response['errors']) {
            return false;
        }

        return true;
    }

    /**
     * Update progress
     *
     * @param int $shopId
     * @param string $totalKey
     * @param string $progressKey
     */
    private function updateProgress(int $shopId, string $totalKey, string $progressKey): void
    {
        $totalProducts = Redis::get($totalKey) ?? 1;
        $deletedCount = Redis::incr($progressKey);

        $progress = intval(($deletedCount / $totalProducts) * 100);
        event(new MessageCompleted(
            $shopId,
            'product-delete',
            ['progress' => $progress]
        ));

        if ($progress >= 100) {
            Redis::del($progressKey);
            Redis::del($totalKey);
        }
    }
}
