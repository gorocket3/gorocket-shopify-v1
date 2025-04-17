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
        if ($plan && $plan->id !== 1) {
            $activeCharge = $shop->charges()->where('status', 'ACTIVE')->first();
            if ($activeCharge) {
                $plan->status = strtoupper($activeCharge->status);
                $plan->billing_on = $activeCharge->billing_on;
            } else {
                $cancelledCharge = $shop->charges()->where('status', 'CANCELLED')
                    ->whereNotNull('expires_on')
                    ->where('expires_on', '>', now())
                    ->orderByDesc('expires_on')
                    ->first();

                if ($cancelledCharge) {
                    $plan->status = $cancelledCharge->status;
                    $plan->billing_on = $cancelledCharge->expires_on;
                }
            }
        }

        $totalProductCount = $shop->products()->count();

        $syncController = app(SyncController::class);
        $response = $syncController->getSyncStatus();

        return response()->json([
            'shop_id'             => $shop->id,
            'plan'                => $plan,
            'total_product_count' => $totalProductCount,
            'sync_data'           => $response->getData()
        ]);
    }
}
