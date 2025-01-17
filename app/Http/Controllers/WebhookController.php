<?php

namespace App\Http\Controllers;

use App\Jobs\HandleProductDeleteJob;
use App\Jobs\HandleProductUpdateJob;
use App\Jobs\HandleShopUpdateJob;
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
        $data = $request->all();
        Log::info(ucfirst($type) . " Webhook Data", $data);

        $jobClass = match ($type) {
            'shop-update'       => HandleShopUpdateJob::class,
            'product-update'    => HandleProductUpdateJob::class,
            'product-delete'    => HandleProductDeleteJob::class,
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
