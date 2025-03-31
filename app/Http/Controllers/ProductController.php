<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    /**
     * Product List View
     *
     * @param Request $request
     * @return View
     */
    public function index(Request $request): View
    {
        $shop = Auth::user();

        $planName = $shop->plan->name ?? 'Free';
        $planLimit = config("plans.max_selected_rows.{$planName}", config("plans.max_selected_rows.Free"));

        $values = [
            'shop_id'             => $shop->id,
            'plan_id'             => $shop->plan_id,
            'plan_selected_limit' => $planLimit,
        ];

        return view('products', ['data' => $values]);
    }
}
