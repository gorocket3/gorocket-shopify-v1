<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Listeners\ProductUpdateListener;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redis;
use Osiset\ShopifyApp\Messaging\Events\AppInstalledEvent;
use Osiset\ShopifyApp\Objects\Values\ShopId;

class ProductController extends Controller
{
    /**
     * Get all products
     *
     * @param Request $request
     * @return JsonResponse
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

        $query = Product::with(['variants.image', 'images', 'options'])->where('user_id', $shop->id)
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
     * Sync products
     *
     * @return JsonResponse
     */
    public function sync(): JsonResponse
    {
        $shop = Auth::user();
        $shopId = new ShopId($shop->id);
        $redisKey = "product_sync_{$shop->id}";

        if (Redis::exists($redisKey)) {
            return response()->json(['message' => 'Already in progress', 'shop_id' => $shop->id], 429);
        }
        Redis::setex($redisKey, 86400, true);

        $listener = new ProductUpdateListener();
        $listener->handle(new AppInstalledEvent($shopId));

        return response()->json(['message' => 'Sync in progress', 'shop_id' => $shop->id]);
    }

    /**
     * Delete multiple products
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function delete(Request $request): JsonResponse
    {
        $shop = Auth::user();

        $productIds = $request->input('product_ids', []);
        if (empty($productIds)) {
            return response()->json(['message' => 'No products to delete', 'shop_id' => $shop->id], 400);
        }

        $failedDeletes = [];
        foreach ($productIds as $productId) {
            $response = $shop->api()->rest('DELETE', "/admin/api/2025-01/products/{$productId}.json");

            if (isset($response['errors']) && $response['errors']) {
                $failedDeletes[] = $productId;
            }
        }

        if (!empty($failedDeletes)) {
            return response()->json([
                'message' => 'Some products failed to delete',
                'failed_products' => $failedDeletes
            ], 207);
        }

        return response()->json(['message' => 'Products deleted successfully', 'shop_id' => $shop->id]);
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

            $shop->api()->rest('PUT', "/admin/api/2025-01/products/{$product->product_id}.json", [
                'product' => [
                    'title' => $data['title']
                ]
            ]);
        }

        return response()->json($shop);
    }
}
