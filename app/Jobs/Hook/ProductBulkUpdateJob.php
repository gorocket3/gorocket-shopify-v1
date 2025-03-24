<?php
namespace App\Jobs\Hook;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProductBulkUpdateJob implements ShouldQueue
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
        $shop_id = $this->container['shop_id'];
        $url = $this->container['url'];

        $batch = [];
        $chunkSize = 1000;
        $stream = fopen($url, 'r');

        while (!feof($stream)) {
            $line = fgets($stream);
            if (!$line) continue;

            $data = json_decode($line, true);
            $productId = (int) str_replace('gid://shopify/Product/', '', $data['id'] ?? '');
            if (!$productId) continue;

            $category = $data['productCategory']['productTaxonomyNode'] ?? null;
            $seo = $data['seo'] ?? null;
            $featuredImage = $data['featuredMedia']['preview']['image']['src'] ?? null;

            $batch[] = [
                'product_id'     => $productId,
                'user_id'        => $shop_id,
                'category'       => is_array($category) ? json_encode($category) : $category,
                'seo'            => is_array($seo) ? json_encode($seo) : $seo,
                'featured_image' => $featuredImage,
                'updated_at'     => now(),
            ];

            if (count($batch) >= $chunkSize) {
                $this->upsertProducts($batch);
                $batch = [];
            }
        }

        if (!empty($batch)) {
            $this->upsertProducts($batch);
        }

        fclose($stream);
        Log::info("[BULK] Product updates completed - shop: {$shop_id}");
    }

    /**
     * Upsert products
     *
     * @param array $batch
     * @return void
     */
    protected function upsertProducts(array $batch): void
    {
        Product::upsert(
            $batch,
            ['product_id', 'user_id'],
            ['category', 'seo', 'featured_image']
        );
    }
}
