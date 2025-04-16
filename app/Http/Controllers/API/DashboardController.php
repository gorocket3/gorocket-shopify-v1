<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $shop = Auth::user();

        $plan = $shop->plan;
        if ($plan) {
            $plan->billing_on = $shop->charges()
                ->where('status', 'ACTIVE')
                ->value('billing_on');
        }

        $totalProductCount = $shop->products()->count();

        $syncController = app(SyncController::class);
        $response = $syncController->getSyncStatus();

        return response()->json([
            'shop_id'             => $shop->id,
            'plan'                => $plan,
            'total_product_count' => $totalProductCount,
            'sync_data'           => $response->getData(),
        ]);
    }
}
