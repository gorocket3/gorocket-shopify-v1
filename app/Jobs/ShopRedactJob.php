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
                Log::info("상점 데이터 삭제 완료 - 도메인: {$this->shopDomain->toNative()}");
            } else {
                Log::warning("상점 정보를 찾을 수 없음 - 도메인: {$this->shopDomain->toNative()}");
            }
        } catch (Exception $e) {
            Log::error("상점 데이터 삭제 실패: {$e->getMessage()}");
        }
    }
}
