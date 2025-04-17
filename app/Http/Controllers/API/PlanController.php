<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AIGeneration;
use App\Models\ChangeLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Osiset\ShopifyApp\Actions\CancelCharge;
use Osiset\ShopifyApp\Actions\GetPlanUrl;
use Osiset\ShopifyApp\Objects\Values\ChargeReference;
use Osiset\ShopifyApp\Objects\Values\NullablePlanId;
use Osiset\ShopifyApp\Objects\Values\PlanId;
use Osiset\ShopifyApp\Objects\Values\ShopId;
use Osiset\ShopifyApp\Services\ChargeHelper;
use Osiset\ShopifyApp\Storage\Models\Plan;
use Throwable;

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
        $latestCharge = $shop->charges()->where('plan_id', $currentPlanId)->orderByDesc('created_at')->first();

        $currentValidPlanId = 1;
        $status = null;
        $billingOn = null;
        if ($latestCharge) {
            $status = strtoupper($latestCharge->status);
            if ($status === 'ACTIVE') {
                $currentValidPlanId = $currentPlanId;
                $billingOn = $latestCharge->billing_on;
            } elseif ($status === 'CANCELLED' && $latestCharge->expires_on && now()->lt($latestCharge->expires_on)) {
                $billingOn = $latestCharge->expires_on;
            }
        }

        $plans = Plan::select('id', 'name', 'price', 'interval', 'terms')
            ->get()
            ->map(function ($plan) use ($currentValidPlanId, $currentPlanId, $billingOn, $status) {
                $planName = $plan->name;

                return [
                    'id'        => $plan->id,
                    'name'      => $plan->name,
                    'price'     => $plan->price,
                    'interval'  => str_replace('_', ' ', $plan->interval),
                    'terms'     => $plan->terms,
                    'user_plan' => $plan->id == $currentValidPlanId,
                    'status'    => ($plan->id == $currentPlanId) ? $status : null,
                    'billing_on' => ($plan->id == $currentPlanId) ? $billingOn : null,
                    'limits'    => [
                        'edit_limit'        => config("plans.edit_limits.{$planName}"),
                        'ai_limit'          => config("plans.ai_limits.{$planName}"),
                        'history_days'      => config("plans.history_days.{$planName}"),
                        'max_selected_cell' => config("plans.max_selected_cell.{$planName}")
                    ]
                ];
            });

        return response()->json([
            'plans'   => $plans,
            'shop_id' => $shop->id,
        ]);
    }

    /**
     * Get Plan Info
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function info(Request $request): JsonResponse
    {
        $shop = Auth::user();

        $only_count = $request->input('only_count');
        $limits     = [];

        if (!isset($only_count)) {
            $planName   = $shop->plan->name ?? 'Free';
            $limits     = [
                'edit_limit'        => config("plans.edit_limits.{$planName}", config("plans.edit_limits.Free")),
                'ai_limit'          => config("plans.ai_limits.{$planName}", config("plans.ai_limits.Free")),
                'history_days'      => config("plans.history_days.{$planName}", config("plans.history_days.Free")),
                'max_selected_cell' => config("plans.max_selected_cell.{$planName}", config("plans.max_selected_cell.Free"))
            ];
        }

        $query = ChangeLog::where('user_id', $shop->id)
            ->where('updated_by', 'gorocket')
            ->whereBetween('created_at', [now()->startOfDay(), now()->endOfDay()]);
        $edit_count = $query->count();

        $query = AIGeneration::where('user_id', $shop->id)
            ->whereBetween('created_at', [now()->startOfDay(), now()->endOfDay()]);
        $ai_count = $query->count();

        $counts = [
            'edit_count' => $edit_count,
            'ai_count'   => $ai_count
        ];

        return response()->json([
            'shop_id' => $shop->id,
            'plan_id' => $shop->plan_id,
            'limits'  => $limits,
            'counts'  => $counts,
        ]);
    }

    /**
     * Confirm Plan
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function confirm(Request $request): JsonResponse
    {
        $shop = Auth::user();

        $planId = $request->input('plan_id');
        $host = $request->input('host');

        $getPlanUrl = app(GetPlanUrl::class);
        $nullablePlanId = $planId ? new NullablePlanId(new PlanId($planId)) : new NullablePlanId();
        $confirmationUrl = $getPlanUrl(new ShopId($shop->getKey()), $nullablePlanId, $host);

        return response()->json([
            'confirmation_url' => $confirmationUrl
        ]);
    }

    /**
     * Cancel Current Plan
     *
     * @param CancelCharge $cancelChargeAction
     * @return JsonResponse
     */
    public function cancel(CancelCharge  $cancelChargeAction): JsonResponse
    {
        $shop = Auth::user();

        try {
            $chargesResponse = $shop->api()->rest('GET', '/admin/api/' . env('SHOPIFY_API_VERSION') . '/recurring_application_charges.json');
            $activeCharge = collect($chargesResponse['body']['recurring_application_charges'] ?? [])->firstWhere('status', 'active');

            if (! $activeCharge) {
                return response()->json([
                    'message' => 'No active plan to cancel.',
                ]);
            }
            $shop->api()->rest('DELETE', "/admin/api/".env('SHOPIFY_API_VERSION')."/recurring_application_charges/{$activeCharge['id']}.json");

            $cancelChargeAction(new ChargeReference($activeCharge['id']));

            $charge = $shop->charges()->where('charge_id', $activeCharge['id'])->orderByDesc('created_at')->first();
            $chargeHelper = app(ChargeHelper::class)->useCharge($charge->getReference());

            return response()->json([
                'message' => 'Your plan has been cancelled.',
                'active_until' => $charge->expires_on ?? $chargeHelper->periodEndDate(),
                'remaining_days' => $chargeHelper->remainingDaysForPeriod()
            ]);
        } catch (Throwable $e) {
            return response()->json(['message' => 'Failed to cancel plan.', 'error' => $e->getMessage()], 500);
        }
    }
}
