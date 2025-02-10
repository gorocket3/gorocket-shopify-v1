<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{

    public function index()
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
        $perPage = request('per_page', 10);
        $products = Product::orderBy('created_at', 'desc')->orderBy('id', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $products->items(),
            'current_page' => $products->currentPage(),
            'last_page' => $products->lastPage(),
            'total' => $products->total(),
            'per_page' => $products->perPage()
        ]);
    }

    /**
     * Edit multiple products
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function edit(Request $request): JsonResponse
    {
        $shop = Auth::user();

        $validated = $request->validate([
            'products' => 'required|array',
            'products.*.id' => 'required|integer|exists:products,id',
            'products.*.title' => 'sometimes|string'
        ]);

        foreach ($validated['products'] as $data) {
            $product = Product::find($data['id']);
            if (isset($data['title'])) {
                $product->title = $data['title'];
            }
            $product->save();
        }

        return response()->json($shop);
    }
}
