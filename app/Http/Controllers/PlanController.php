<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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

        /* Plans List */
        $sql = "
            SELECT `id`
                 , `name`
                 , `price`
                 , `interval`
                 , `terms`
                 , ((SELECT `plan_id` FROM users WHERE `id` = (SELECT `user_id` FROM shops WHERE `id` = :shop_id)) = `id`) AS `user_plan`
            FROM plans
        ";
        $plans = DB::select($sql, [ 'shop_id' => $shop->id ?? '' ]);
        $plans = array_map(fn($row) => array_merge((array) $row, [
            'interval'  => str_replace('_', ' ', $row->interval),
            'user_plan' => (bool) $row->user_plan
        ]), $plans);

        $values = [
            'plans'     => $plans,
            'shop_id'   => $shop->id ?? ''
        ];

        return view('plan', [ 'data' => $values ]);
    }
}
