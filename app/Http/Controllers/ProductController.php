<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Osiset\ShopifyApp\Services\ChargeHelper;

class ProductController extends Controller
{
    /**
     * limit daily requests
     */
    const FREE_MAX_SELECTED_ROWS = 10000; // 추후 수정 (10)
    const BASIC_MAX_SELECTED_ROWS = 100000; // 추후 수정 (100)

    /**
     * Product List View
     *
     * @param Request $request
     * @return View
     */
    public function index(Request $request): View
    {
        $shop_id    = Auth::user()->id ?? '';
        $plan_id    = DB::table('users')->where('id', $shop_id)->value('plan_id');
        $plan_limit = match ($plan_id) {
            2 => self::BASIC_MAX_SELECTED_ROWS,
            default => self::FREE_MAX_SELECTED_ROWS
        };

        $values = [
            'shop_id'               => $shop_id,
            'plan_id'               => $plan_id,
            'plan_selected_limit'   => $plan_limit
        ];

        return view('products', [ 'data' => $values ]);
    }
}
