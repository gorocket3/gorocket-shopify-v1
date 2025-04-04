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
use Illuminate\Support\Facades\DB;
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
            $shop = $this->container['shop'];
            $productIds = $this->container['product_ids'];
            $progress = $this->container['progress'];

            $mutations = [];
            foreach ($productIds as $productId) {
                $mutationName = "deleteProduct" . $productId;
                $mutations[] = sprintf(
                    '%s: productDelete(input: { id: "gid://shopify/Product/%s" }) {
                deletedProductId
                userErrors {
                    field
                    message
                }
            }',
                    $mutationName,
                    $productId
                );
            }

            $query = sprintf('mutation {%s}', implode("\n", $mutations));
            $response = $shop->api()->graph($query);

            if (empty($response['errors'])) {

                DB::statement("SET @UPDATE_BY = 'gorocket'");

                Product::whereIn('product_id', $productIds)->delete();

                DB::statement("SET @UPDATE_BY = NULL");
            }

            event(new MessageCompleted(
                $shop->id,
                'product-delete',
                ['progress' => $progress]
            ));

        } catch (Exception $e) {
            Log::error("[APP][PRODUCT] Delete failed - {$shop->id}, Error: {$e->getMessage()}");
        }
    }
}
