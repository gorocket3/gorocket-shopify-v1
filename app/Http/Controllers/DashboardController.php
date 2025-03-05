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

        $values = [
            'shop_id' => $shop->id ?? ''
        ];

        return view('welcome', [ 'data' => $values ]);
    }
}
