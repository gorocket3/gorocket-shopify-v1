<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Auth;
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
        $shop = Auth::user();

        $sql = "
            SELECT `id`
                 , `type`
                 , `name`
                 , `price`
                 , `interval`
                 , `capped_amount`
                 , `terms`
                 , `trial_days`
                 , `on_install`
            FROM `plans`
            WHERE `id` = (
                SELECT `plan_id`
                FROM users
                WHERE `id` = (SELECT `user_id` FROM shops WHERE `id` = :shop_id)
            )
        ";
        $plan = DB::selectOne($sql, [ 'shop_id' => $shop->id ?? '' ]);

        $sql = "
            SELECT COUNT(`id`) AS total
            FROM `products`
            WHERE `user_id` = (SELECT `user_id` FROM shops WHERE `id` = :shop_id)
        ";
        $total_product_count = DB::selectOne($sql, [ 'shop_id' => $shop->id ?? '' ])->total;

        $values = [
            'shop_id' => $shop->id ?? '',
            'plan' => $plan,
            'total_product_count' => $total_product_count,
        ];

        return view('welcome', [ 'data' => $values ]);
    }
}
