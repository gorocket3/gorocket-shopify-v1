<?php

namespace App\Http\Controllers;

use App\Jobs\Hook\ProductDeleteJob;
use App\Jobs\Hook\ProductUpdateJob;
use App\Jobs\Hook\ShopUpdateJob;
use App\Models\Product;
use App\Models\Shop;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

class WebhookController extends Controller
{
    /**
     * Handle incoming webhooks dynamically.
     *
     * @param Request $request
     * @param string $type
     * @return JsonResponse
     */
    private function handleWebhook(Request $request, string $type): JsonResponse
    {
        $payload = $request->all();
        $productId = $payload['id'] ?? null;
        $updatedAt = $payload['updated_at'] ?? null;

        $shopDomain = $request->header('x-shopify-shop-domain');
        $shop = Shop::where('myshopify_domain', $shopDomain)->first();
        if (!$shop) {
            Log::error("[HOOK][ERROR] Shop not found - {$shopDomain}");
            return response()->json(['status' => 'error', 'message' => 'Shop not found'], 404);
        }
        $payload['user_id'] = $shop->user_id;
        Log::info("[HOOK][RECEIVED] Webhook: {$type}", $payload);

        if ($this->shouldSkipWebhook($productId, $updatedAt, $shop->timezone)) {
            return response()->json(['message' => 'Ignored webhook']);
        }

        if (!$this->dispatchJob($type, $payload)) {
            return response()->json(['status' => 'error', 'message' => 'Invalid webhook type'], 400);
        }
        return response()->json(['status' => 'success']);
    }

    /**
     * Check if webhook should be skipped.
     *
     * @param string|null $productId
     * @param string|null $updatedAt
     * @param string|null $timezone
     * @return bool
     */
    private function shouldSkipWebhook(?string $productId, ?string $updatedAt, ?string $timezone): bool
    {
        if (!$productId || !$updatedAt || !$timezone) {
            return false;
        }

        $product = Product::where('product_id', $productId)->first();
        if ($product) {
            $webhookUpdatedAt = Carbon::parse($updatedAt)->setTimezone('UTC');
            if ($webhookUpdatedAt < $product->updated_at) {
                Log::info("[HOOK][HANDLE] Webhook outdated - {$productId}");
                return true;
            }
        }

        if (Redis::exists($productId)) {
            Redis::del($productId);
            Log::info("[HOOK][HANDLE] Webhook ignored - {$productId}");
            return true;
        }
        return false;
    }

    /**
     * Dispatch job based on webhook type.
     *
     * @param string $type
     * @param array $payload
     * @return bool
     */
    private function dispatchJob(string $type, array $payload): bool
    {
        $jobs = [
            'shop-update'    => ShopUpdateJob::class,
            'product-update' => ProductUpdateJob::class,
            'product-delete' => ProductDeleteJob::class,
        ];

        if (!isset($jobs[$type])) {
            Log::error("[HOOK][ERROR] Invalid webhook type: {$type}");
            return false;
        }

        dispatch(new $jobs[$type]($payload));
        return true;
    }

    /**
     * Handle shop update webhook.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function handleShopUpdate(Request $request): JsonResponse
    {
        return $this->handleWebhook($request, 'shop-update');
    }

    /**
     * Handle product update webhook.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function handleProductUpdate(Request $request): JsonResponse
    {
        return $this->handleWebhook($request, 'product-update');
    }

    /**
     * Handle product delete webhook.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function handleProductDelete(Request $request): JsonResponse
    {
        return $this->handleWebhook($request, 'product-delete');
    }
}
