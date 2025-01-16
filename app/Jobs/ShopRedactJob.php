<?php
namespace App\Jobs;

use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use App\Models\User;
use Osiset\ShopifyApp\Objects\Values\ShopDomain;
use Illuminate\Support\Facades\Log;

class ShopRedactJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The shop's myshopify domain.
     *
     * @var ShopDomain
     */
    public ShopDomain $shopDomain;

    /**
     * The webhook data.
     *
     * @var object
     */
    public object $data;

    /**
     * Create a new job instance.
     *
     * @param ShopDomain $shopDomain
     * @param object $data
     */
    public function __construct(ShopDomain $shopDomain, object $data)
    {
        $this->shopDomain = $shopDomain;
        $this->data = $data;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $shop = User::where('name', $this->shopDomain->toNative())->first();

            if ($shop) {
                $shop->delete();
                Log::info("Shop data successfully deleted - Domain: {$this->shopDomain->toNative()}");
            } else {
                Log::warning("Shop not found - Domain: {$this->shopDomain->toNative()}");
            }
        } catch (Exception $e) {
            Log::error("Failed to delete shop data: {$e->getMessage()}");
        }
    }
}
