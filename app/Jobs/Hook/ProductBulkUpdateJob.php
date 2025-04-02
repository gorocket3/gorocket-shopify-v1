<?php
namespace App\Jobs\Hook;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
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

        $chunkSize = 500;
        $products = [];
        $collectionsMap = [];

        $stream = fopen($url, 'r');

        while (!feof($stream)) {
            $line = fgets($stream);
            if (!$line) continue;

            $data = json_decode($line, true);

            if (str_starts_with($data['id'] ?? '', 'gid://shopify/Product/')) {
                $productId = (int) str_replace('gid://shopify/Product/', '', $data['id']);
                if (!$productId) continue;

                $category = $data['productCategory']['productTaxonomyNode'] ?? null;
                $seo = $data['seo'] ?? null;
                $featuredImage = $data['featuredMedia']['preview']['image']['src'] ?? null;

                $products[$productId] = [
                    'product_id'      => $productId,
                    'user_id'         => $shop_id,
                    'category'        => $category['name'] ?? null,
                    'seo_title'       => $seo['title'] ?? null,
                    'seo_description' => $seo['description'] ?? null,
                    'featured_image'  => $featuredImage
                ];
            }

            elseif (str_starts_with($data['id'] ?? '', 'gid://shopify/Collection/')) {
                $parentId = (int) str_replace('gid://shopify/Product/', '', $data['__parentId'] ?? '');
                $title = $data['title'] ?? null;
                if ($parentId && $title) {
                    $collectionsMap[$parentId][] = $title;
                }
            }
        }

        fclose($stream);

        $batch = [];
        foreach ($products as $productId => $item) {
            $item['collections'] = implode(', ', $collectionsMap[$productId] ?? []);
            $batch[] = $item;

            if (count($batch) >= $chunkSize) {
                $this->upsertProducts($batch);
                $batch = [];
            }
        }

        if (!empty($batch)) {
            $this->upsertProducts($batch);
        }

        Log::info("[SETUP][BULK] Bulk completed - {$shop_id}");
    }

    /**
     * Upsert products
     *
     * @param array $batch
     * @return void
     */
    protected function upsertProducts(array $batch): void
    {
        DB::statement("SET @DISABLE_PRODUCT_TRIGGER = 1");

        Product::upsert(
            $batch,
            ['product_id', 'user_id'],
            ['category', 'seo_title', 'seo_description', 'featured_image', 'collections']
        );

        DB::statement("SET @DISABLE_PRODUCT_TRIGGER = NULL");
    }
}
