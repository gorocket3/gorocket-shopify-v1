<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;
use Osiset\ShopifyApp\Storage\Models\Plan;

class ProductController extends Controller
{

    public function index(): JsonResponse
    {
        $shop = Auth::user();


        //$response = $shop->api()->rest('GET', "/admin/api/2025-01/products/7885367803938.json");

        $response = $shop->api()->rest('PUT', "/admin/api/2025-01/products/7885367803938.json", [
            'product' => [
                'id' => 7885367803938,
                'title' => 'The Videographer Snowboard22333333333',
            ],
        ]);

        echo "<pre>";
        print_r($response['body']);
        exit;

    }



    /**
     * Get all products
     */
    public function list(): JsonResponse
    {
        $perPage = request('per_page', 500);
        $products = Product::orderBy('created_at', 'desc')->orderBy('id', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $products->items(),
            'current_page' => $products->currentPage(),
            'last_page' => $products->lastPage(),
            'total' => $products->total(),
            'per_page' => $products->perPage()
        ]);
    }
}
