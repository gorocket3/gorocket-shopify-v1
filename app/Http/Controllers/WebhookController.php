<?php

namespace App\Http\Controllers;

use App\Jobs\Hook\ProductDeleteJob;
use App\Jobs\Hook\ProductUpdateJob;
use App\Jobs\Hook\ShopUpdateJob;
use App\Models\Shop;
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
        $shop_domain = $request->header('x-shopify-shop-domain');
        $user_id = Shop::where('myshopify_domain', $shop_domain)->value('user_id');
        if (!$user_id) {
            Log::error("[HOOK][HANDLE] Shop not found - {$request->header('x-shopify-shop-domain')}");
            return response()->json(['status' => 'error', 'message' => 'Shop not found'], 404);
        }

        $request->merge(['user_id' => $user_id]);
        $data = $request->all();
        Log::info("[HOOK][HANDLE] Webhook received - {$type}", $data);

        $jobClass = match ($type) {
            'shop-update'       => ShopUpdateJob::class,
            'product-update'    => ProductUpdateJob::class,
            'product-delete'    => ProductDeleteJob::class,
            default => null,
        };

        if ($jobClass) {
            $jobClass::dispatch($data);
            return response()->json(['status' => 'success'], 200);
        }

        return response()->json(['status' => 'error', 'message' => 'Invalid webhook type'], 400);
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
