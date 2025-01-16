<?php

namespace App\Listeners;

use App\Jobs\HandleShopUpdateJob;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Log;
use Osiset\ShopifyApp\Messaging\Events\AppInstalledEvent;

class HandleShopUpdateListener
{
    /**
     * Handle the app installed event.
     *
     * @param AppInstalledEvent $event
     * @return void
     */
    public function handle(AppInstalledEvent $event): void
    {
        try {
            $shopId = $event->shopId->toNative();

            $shop = User::find($shopId);
            if (!$shop) {
                Log::error("스토어 정보를 찾을 수 없습니다. Shop ID: {$shopId}");
                return;
            }

            $response = $shop->api()->rest('GET', '/admin/api/2025-01/shop.json');
            if ($response['errors'] ?? false) {
                Log::error("Shopify API 호출 실패 - Shop ID: {$shopId}");
                return;
            }

            $container = (array) $response['body']['shop']['container'];

            HandleShopUpdateJob::dispatch($container);

            Log::info("스토어 정보 큐 등록 완료 - 도메인: {$container['myshopify_domain']}");
        } catch (Exception $e) {
            Log::error("앱 설치 처리 중 오류 발생: " . $e->getMessage());
        }
    }
}
