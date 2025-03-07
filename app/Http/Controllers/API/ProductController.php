<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Jobs\App\ProductDeleteJob;
use App\Jobs\App\ProductUpdateJob;
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
            'per_page' => 'integer|min:1|max:1000',
            'title' => 'nullable|string|max:512',
            'content' => 'nullable|string',
            'product_type' => 'nullable|string|max:200',
            'vendor' => 'nullable|string|max:200',
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
            'products' => 'required|array|min:1',
            'products.*.id' => 'required|integer|exists:products,product_id',
            'products.*.title' => 'sometimes|string|max:255',
            'products.*.status' => 'sometimes|string|max:100',
            'products.*.tags' => 'nullable|string',
            'products.*.tags.*' => 'string|max:255',
            'products.*.body_html' => 'nullable|string',
            'products.*.variants' => 'sometimes|array|min:1',
            'products.*.variants.*.id' => 'required|integer|exists:product_variants,variant_id',
            'products.*.variants.*.price' => 'required|numeric|min:0',
            'products.*.variants.*.compare_at_price' => 'nullable|numeric|min:0',
            'products.*.variants.*.inventory_item_id' => 'required|integer',
            'products.*.variants.*.inventory_quantity' => 'required|integer|min:0',
            'products.*.variants.*.weight' => 'nullable|numeric|min:0',
            'products.*.variants.*.weight_unit' => 'nullable|string|in:g,kg,lb,oz',
            'products.*.variants.*.sku' => 'nullable|string|max:255',
            'products.*.variants.*.inventory_policy' => 'nullable|string|in:continue,deny',
            'products.*.variants.*.taxable' => 'nullable|boolean',
            'products.*.variants.*.barcode' => 'nullable|string|max:255',
            'products.*.variants.*.requires_shipping' => 'nullable|boolean'
        ]);

        $validated['products'] = array_map(function ($product) {
            if (is_null($product['body_html'])) $product['body_html'] = '';
            if (is_null($product['tags'])) $product['tags'] = '';
            return $product;
        }, $validated['products']);

        ProductUpdateJob::dispatch([
            'shop' => $shop,
            'products' => $validated['products']
        ]);

        return response()->json([
            'message' => 'Product edit job dispatched successfully',
            'shop_id' => $shop->id
        ]);
    }
}
