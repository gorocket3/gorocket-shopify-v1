<?php

namespace App\Http\Controllers;

use App\Http\Controllers\API\SyncController;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Dashboard View
     *
     * @return View
     */
    public function index(): View
    {
        $shop       = Auth::user();
        $shop_id    = $shop->id ?? '';

        $default_plan_id = Cache::rememberForever('default_plan_id', function () {
            return DB::table('plans')->where('on_install', true)->value('id');
        });

        $user_id            = DB::table('shops')->where('id', $shop_id)->value('user_id');
        $user_plan_id       = DB::table('users')->where('id', $user_id)->value('plan_id');
        $plan_id            = $user_plan_id ?? $default_plan_id;
        $plan               = DB::table('plans')->where('id', $plan_id)->first();
        $plan->billing_on   = DB::table('charges')->where('user_id', $user_id)->where('status', 'ACTIVE')->value('billing_on');

        $total_product_count = DB::table('products')->where('user_id', $user_id)->count();

        $syncController = app(SyncController::class);
        $response = $syncController->getSyncStatus($shop_id);

        $values = [
            'shop_id'               => $shop_id,
            'plan'                  => $plan,
            'total_product_count'   => $total_product_count,
            'sync_data'             => $response->getData()
        ];

        return view('welcome', [ 'data' => $values ]);
    }
}
