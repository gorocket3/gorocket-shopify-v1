<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    /**
     * Get all products
     */
    public function list(Request $request): JsonResponse
    {
        $shop = Auth::user();

        $perPage = $request->input('per_page', 10);
        $title = $request->input('title');
        $content = $request->input('content');
        $product_type = $request->input('product_type');
        $vendor = $request->input('vendor');
        $status = $request->input('status');
        $tags = $request->input('tags');

        $allowedSearchTypes = ['created_at', 'updated_at'];
        $searchType = $request->input('search_type', 'created_at');
        if (!in_array($searchType, $allowedSearchTypes)) {
            $searchType = 'created_at';
        }
        $startDate = $request->input('start_date') ? $request->input('start_date') . ' 00:00:00' : null;
        $endDate = $request->input('end_date') ? $request->input('end_date') . ' 23:59:59' : null;

        $query = Product::with('image')->where('user_id', 6)
            ->when($title, function ($q) use ($title) {
                $q->where('title', 'LIKE', "%{$title}%");
            })
            ->when($content, function ($q) use ($content) {
                $q->where('body_html', 'LIKE', "%{$content}%");
            })
            ->when($product_type, function ($q) use ($product_type) {
                $q->where('product_type', 'LIKE', "%{$product_type}%");
            })
            ->when($vendor, function ($q) use ($vendor) {
                $q->where('vendor', 'LIKE', "%{$vendor}%");
            })
            ->when($status, function ($q) use ($status) {
                $q->where('status', $status);
            })
            ->when($tags, function ($q) use ($tags) {
                $q->where('tags', 'LIKE', "%{$tags}%");
            })
            ->when($startDate && $endDate, function ($q) use ($startDate, $endDate, $searchType) {
                $q->whereBetween($searchType, [$startDate, $endDate]);
            })
            ->orderByDesc('created_at');

        $products = $query->paginate($perPage);

        return response()->json($products);
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

        $response = $shop->api()->rest('PUT', "/admin/api/2025-01/products/7896532123682.json", [
            'product' => [
                'id' => 7896532123682,
                'title' => 'ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ',
            ],
        ]);

        return response()->json($shop);
    }
}
