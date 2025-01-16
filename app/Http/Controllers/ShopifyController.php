<?php

namespace App\Http\Controllers;

use App\Jobs\HandleShopUpdateJob;
use App\Models\Shop;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ShopifyController extends Controller
{
    public function home(): void
    {
        $shop = Auth::user();
        $response = $shop->api()->rest('GET', '/admin/api/2025-01/webhooks.json');




        echo "<pre>";
        print_r($response['body']);
    }




    /**
     * Handle shop update webhook.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function handleShopUpdate(Request $request): JsonResponse
    {
        $data = $request->all();

        HandleShopUpdateJob::dispatch($data);

        return response()->json(['status' => 'success'], 200);
    }

    /**
     * Handle product update webhook.
     *
     * @param Request $request
     */
    public function handleProductUpdate(Request $request)
    {
        $data = $request->all();

        Log::info("Product Update Webhook Data", $data);
    }
}
