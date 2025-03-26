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















    public function test1()
    {
        $shop = Auth::user();

        $response = $shop->api()->rest('GET', '/admin/api/2025-01/users/current.json');
        $currentUser = $response;

        echo "<pre>";
        print_r($currentUser);
        exit;

        $productId = 7910421659682;

        // 상품 타이틀 수정
        $productPayload = [
            'product' => [
                'title' => '새로운 상품 타이틀' // 수정할 상품 타이틀
            ]
        ];

        $shop->api()->rest('PUT', '/admin/api/' . env('SHOPIFY_API_VERSION') . '/products/' . $productId . '.json', $productPayload);

        // 변형 가격 수정
        $variants = [
            [
                'id' => 43518114005026, // 레드
                'variant' => [
                    'price' => 2222222.00
                ]
            ]
        ];

        foreach ($variants as $variant) {
            $payload = [
                'variant' => $variant['variant']
            ];

            $response = $shop->api()->rest('PUT', '/admin/api/' . env('SHOPIFY_API_VERSION') . '/variants/' . $variant['id'] . '.json', $payload);

            echo "<pre>";
            print_r($response['body']['variant']);
        }




    }

    public function test2()
    {
        $shop = Auth::user();
        $response = $shop->api()->rest('GET', '/admin/api/' . env('SHOPIFY_API_VERSION') . '/products.json', [
            'limit' => 2
        ]);

        echo "<pre>";
        print_r($response['body']['products']);
        exit;
    }


    public function test3(ChargeHelper $chargeHelper)
    {
        $shop = Auth::user();

        $activeCharge = $shop->charges()->where('status', 'active')->first();

        $chargeHelper->useCharge($activeCharge->getReference());

        $chargeData = $chargeHelper->retrieve($shop);

        echo "<pre>";
        print_r($chargeData);
        exit;

    }

    public function test4(ChargeHelper $chargeHelper)
    {
        $shop = Auth::user();

        $response = $shop->api()->rest('GET', "/admin/api/" . env('SHOPIFY_API_VERSION') . "/products/7885367672866/metafields.json");

        echo "<pre>";
        print_r($response['body']);
        exit;

    }
}
