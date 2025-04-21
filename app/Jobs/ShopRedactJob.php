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
     * @var string
     */
    public string $shopDomain;

    /**
     * The webhook data.
     *
     * @var object
     */
    public object $data;

    /**
     * Create a new job instance.
     *
     * @param string $shopDomain
     * @param object $data
     */
    public function __construct(string $shopDomain, object $data)
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
            $shop = User::where('name', $this->shopDomain)->first();
            if ($shop) {
                Log::info("[GDPR] shop/redact - {$this->shopDomain}");
            } else {
                Log::warning("[GDPR] shop/redact - {$this->shopDomain} - Shop not found");
            }
        } catch (Exception $e) {
            Log::error("[GDPR] shop/redact - {$this->shopDomain} - Error: {$e->getMessage()}");
        }
    }
}
