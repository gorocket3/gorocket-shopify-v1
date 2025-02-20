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
     * Product List View
     *
     * @param Request $request
     * @return View
     */
    public function index(Request $request): View
    {
        /* Product Type List */
        $sql = "
            SELECT DISTINCT user_id, TRIM(product_type) AS product_type
            FROM products
            WHERE product_type != ''
        ";
        $types = DB::select($sql);
        $types = array_map(fn($row) => $row->product_type, $types);

        /* Product Status List */
        $sql = "
            SELECT DISTINCT user_id, TRIM(status) AS status
            FROM products
            WHERE status != ''
        ";
        $status = DB::select($sql);
        $status = array_map(fn($row) => $row->status, $status);

        /* Product Tag List */
        $sql = "
            SELECT DISTINCT user_id, TRIM(tag) AS tag
            FROM products,
            JSON_TABLE(
                CONCAT('[\"', REPLACE(tags, ',', '\",\"'), '\"]'),
                '$[*]' COLUMNS (tag VARCHAR(255) PATH '$')
            ) AS tag_table WHERE tag != ''
        ";
        $tags = DB::select($sql);
        $tags = array_map(fn($row) => $row->tag, $tags);

        $values = [
            'types'     => $types,
            'status'    => $status,
            'tags'      => $tags,
            'shop_id'   => Auth::user()->id ?? ''
        ];

        return view('product.list', $values);
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
