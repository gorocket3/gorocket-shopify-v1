<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Jobs\App\ProductDeleteJob;
use App\Listeners\ProductUpdateListener;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        $validated = $request->validate([
            'per_page' => 'integer|min:1|max:100',
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'product_type' => 'nullable|string|max:100',
            'vendor' => 'nullable|string|max:100',
            'status' => 'nullable|array',
            'status.*' => 'string',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'search_type' => 'nullable|in:created_at,updated_at',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $perPage = $validated['per_page'] ?? 50;
        $searchType = $validated['search_type'] ?? 'created_at';

        $startDate = isset($validated['start_date']) ? $validated['start_date'] . ' 00:00:00' : null;
        $endDate = isset($validated['end_date']) ? $validated['end_date'] . ' 23:59:59' : null;

        $query = Product::with(['variants.image', 'images', 'options'])->where('user_id', $shop->id);
        $this->applyFilters($query, $validated);
        if ($startDate && $endDate) {
            $query->whereBetween($searchType, [$startDate, $endDate]);
        }
        $products = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json($products);
    }

    /**
     * Apply filters to the query
     *
     * @param mixed $query
     * @param array $filters
     */
    private function applyFilters(mixed $query, array $filters): void
    {
        $query->when($filters['title'] ?? null, fn($q, $title) => $q->where('title', 'LIKE', "%{$title}%"))
            ->when($filters['content'] ?? null, fn($q, $content) => $q->where('body_html', 'LIKE', "%{$content}%"))
            ->when($filters['product_type'] ?? null, fn($q, $type) => $q->where('product_type', $type))
            ->when($filters['vendor'] ?? null, fn($q, $vendor) => $q->where('vendor', $vendor))
            ->when($filters['status'] ?? null, fn($q, $status) => $q->whereIn('status', $status))
            ->when($filters['tags'] ?? null, fn($q, $tags) => $q->where(function ($subQuery) use ($tags) {
                foreach ($tags as $tag) {
                    $subQuery->orWhere('tags', 'LIKE', "%$tag%");
                }
            }));
    }

    /**
     * Sync products
     *
     * @param ProductUpdateListener $listener
     * @return JsonResponse
     */
    public function sync(ProductUpdateListener $listener): JsonResponse
    {
        $shop = Auth::user();
        $shopId = new ShopId($shop->id);

        $listener->handle(new AppInstalledEvent($shopId));

        return response()->json([
            'message' => 'Product sync job dispatched successfully',
            'shop_id' => $shopId
        ]);
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

        $validated = $request->validate([
            'product_ids' => 'required|array|min:1',
            'product_ids.*' => 'integer|exists:products,product_id'
        ]);

        ProductDeleteJob::dispatch([
            'shop' => $shop,
            'product_ids' => $validated['product_ids']
        ]);

        return response()->json([
            'message' => 'Product deletion job dispatched successfully',
            'shop_id' => $shop->id
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

            $shop->api()->rest('PUT', "/admin/api/2025-01/products/{$product->product_id}.json", [
                'product' => [
                    'title' => $data['title']
                ]
            ]);
        }

        return response()->json($shop);
    }
}
