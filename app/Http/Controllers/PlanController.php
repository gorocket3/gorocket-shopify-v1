<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Osiset\ShopifyApp\Storage\Models\Plan;

class PlanController extends Controller
{
    /**
     * Plans List View
     *
     * @return View
     */
    public function index(): View
    {
        $shop = Auth::user();

        $currentPlanId = $shop->plan_id;

        $plans = Plan::select('id', 'name', 'price', 'interval', 'terms')
            ->get()
            ->map(function ($plan) use ($currentPlanId) {
                $planName = $plan->name;

                return [
                    'id'         => $plan->id,
                    'name'       => $plan->name,
                    'price'      => $plan->price,
                    'interval'   => str_replace('_', ' ', $plan->interval),
                    'terms'      => $plan->terms,
                    'user_plan'  => $plan->id == $currentPlanId,
                    'limits'     => [
                        'edit_limit'        => config("plans.edit_limits.{$planName}"),
                        'history_days'      => config("plans.history_days.{$planName}"),
                        'max_selected_rows' => config("plans.max_selected_rows.{$planName}")
                    ]
                ];
            });

        $values = [
            'plans'     => $plans,
            'shop_id'   => $shop->id ?? ''
        ];

        return view('plan', [ 'data' => $values ]);
    }
}
