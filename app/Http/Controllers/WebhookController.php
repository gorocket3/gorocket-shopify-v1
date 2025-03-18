<?php

namespace App\Http\Controllers;

use App\Jobs\Hook\InventoryItemsUpdateJob;
use App\Jobs\Hook\ProductDeleteJob;
use App\Jobs\Hook\ProductUpdateJob;
use App\Jobs\Hook\ShopUpdateJob;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Shop;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
        $typeId = $payload['id'] ?? null;
        $updatedAt = $payload['updated_at'] ?? null;

        $shopDomain = $request->header('x-shopify-shop-domain');
        $shop = Shop::where('myshopify_domain', $shopDomain)->first();
        if (!$shop) {
            Log::error("[HOOK][ERROR] Shop not found - {$shopDomain}");
            return response()->json(['status' => 'error', 'message' => 'Shop not found'], 404);
        }
        $payload['user_id'] = $shop->user_id;

        if ($this->shouldSkipWebhook($type, $typeId, $updatedAt, $payload)) {
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
     * @param string $type
     * @param string $typeId
     * @param string|null $updatedAt
     * @param array $payload
     * @return bool
     */
    private function shouldSkipWebhook(string $type, string $typeId, ?string $updatedAt, array $payload): bool
    {
        if (!$typeId) {
            return false;
        }

        $isData = ($type === 'inventory-items-update')
            ? ProductVariant::where('inventory_item_id', $typeId)->first(['updated_at'])
            : Product::where('product_id', $typeId)->first(['updated_at']);

        if ($isData && !empty($updatedAt) && strtotime($updatedAt) !== false) {
            $rawTimezone = Shop::where('user_id', $payload['user_id'])->value('timezone') ?? 'UTC';
            $timezone = trim(preg_replace('/^\(GMT[+-]\d{2}:\d{2}\) /', '', $rawTimezone)) ?: 'UTC';
            try {
                $updatedAtUtc = Carbon::parse($updatedAt, $timezone)->setTimezone('UTC');
                if ($updatedAtUtc->lessThanOrEqualTo($isData->updated_at)) {
                    Log::info("[HOOK][".strtoupper($type)."] Webhook ignored - {$typeId}");
                    return true;
                }
            } catch (Exception $e) {
                Log::error("[HOOK][ERROR] Invalid date format for product {$typeId}: " . $e->getMessage());
                return false;
            }
        } else {
            Log::info("[HOOK][".strtoupper($type)."] Webhook ignored - {$typeId}");
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
            'shop-update'               => ShopUpdateJob::class,
            'product-update'            => ProductUpdateJob::class,
            'product-delete'            => ProductDeleteJob::class,
            'inventory-items-update'    => InventoryItemsUpdateJob::class,
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

    /**
     * Handle inventory items update webhook.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function handleInventoryItemsUpdate(Request $request): JsonResponse
    {
        return $this->handleWebhook($request, 'inventory-items-update');
    }

    /*
     * Handle inventory level update webhook.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function handleInventoryLevelsUpdate(Request $request): JsonResponse
    {
        return response()->json(['status' => 'not-implemented']);
    }
}
