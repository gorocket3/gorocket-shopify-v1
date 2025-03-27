<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Osiset\ShopifyApp\Storage\Models\Plan;

class PlanController extends Controller
{
    /**
     * Get Plans List
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $shop = Auth::user();

        $currentPlanId = $shop->plan_id;

        $plans = Plan::select('id', 'name', 'price', 'interval', 'terms')
            ->get()
            ->map(fn($plan) => [
                'id'         => $plan->id,
                'name'       => $plan->name,
                'price'      => $plan->price,
                'interval'   => str_replace('_', ' ', $plan->interval),
                'terms'      => $plan->terms,
                'user_plan'  => $plan->id == $currentPlanId
            ]);

        return response()->json([
            'plans'   => $plans,
            'shop_id' => $shop->id,
        ]);
    }

    /**
     * Get Plan Info
     *
     * @return JsonResponse
     */
    public function info(): JsonResponse
    {
        $shop = Auth::user();

        $planName = $shop->plan->name ?? 'Free';
        $planLimit = config("plans.max_selected_rows.{$planName}", config("plans.max_selected_rows.Free"));

        return response()->json([
            'shop_id'             => $shop->id,
            'plan_id'             => $shop->plan_id,
            'plan_selected_limit' => $planLimit
        ]);
    }
}
