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
        $products = $query->latest()->paginate($perPage);

        return response()->json($products);
    }

    /**
     * Get the count of all products
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function count(Request $request): JsonResponse
    {
        $shop = Auth::user();

        $query = Product::where('user_id', $shop->id);
        $count = $query->count();

        return response()->json(['count' => $count]);
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
            'product_ids.*' => 'integer'
        ]);

        $processed = 0;
        $totalProducts = count($validated['product_ids']);

        $chunks = array_chunk($validated['product_ids'], 10);
        foreach ($chunks as $chunk) {
            $processed += count($chunk);
            $progress = min(100, round(($processed / $totalProducts) * 100));

            ProductDeleteJob::dispatch([
                'shop' => $shop,
                'product_ids' => $validated['product_ids'],
                'progress' => $progress
            ]);
        }

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
            'products.*.id' => 'required|integer',
            'products.*.category' => 'nullable|string|max:255',
            'products.*.seo_title' => 'nullable|string|max:255',
            'products.*.seo_description' => 'nullable|string|max:255',
            'products.*.title' => 'sometimes|string|max:255',
            'products.*.status' => 'sometimes|string|max:100',
            'products.*.tags' => 'nullable|string',
            'products.*.tags.*' => 'string|max:255',
            'products.*.body_html' => 'nullable|string',
            'products.*.product_type' => 'nullable|string|max:255',
            'products.*.vendor' => 'nullable|string|max:255',
            'products.*.handle' => 'nullable|string|max:255',
            'products.*.variants' => 'sometimes|array|min:1',
            'products.*.variants.*.id' => 'required|integer',
            'products.*.variants.*.price' => 'required|numeric|min:0',
            'products.*.variants.*.compare_at_price' => 'nullable|numeric|min:0',
            'products.*.variants.*.inventory_item_id' => 'required|integer',
            'products.*.variants.*.inventory_management' => 'required|boolean',
            'products.*.variants.*.inventory_quantity' => 'required_if:products.*.variants.*.inventory_management,1,true|integer|min:0',
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

        $processed = 0;
        $totalProducts = count($validated['products']);

        $chunks = array_chunk($validated['products'], 10);
        foreach ($chunks as $chunk) {
            $processed += count($chunk);
            $progress = min(100, round(($processed / $totalProducts) * 100));

            ProductUpdateJob::dispatch([
                'shop' => $shop,
                'products' => $chunk,
                'progress' => $progress
            ]);
        }

        return response()->json([
            'message' => 'Product edit job dispatched successfully',
            'shop_id' => $shop->id
        ]);
    }

    /**
     * Check if the handle is unique
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function checkHandle(Request $request): JsonResponse
    {
        $shop = Auth::user();

        $request->validate([
            'handle' => 'required|string|max:255'
        ]);

        $exists = Product::where('user_id', $shop->id)->where('handle', $request->handle)->exists();

        return response()->json([
            'handle' => $request->handle,
            'exists' => $exists
        ]);
    }

    /**
     * Get the preview URL of a product
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getPreviewUrl(Request $request): JsonResponse
    {
        $shop = Auth::user();

        $productId = $request->get('product_id');

        $response = $shop->api()->graph('{
            product(id: "gid://shopify/Product/' . $productId . '") {
                id
                handle
                onlineStorePreviewUrl
            }
        }');

        $product = $response['body']['data']['product'] ?? null;

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        return response()->json([
            'preview_url' => $product['onlineStorePreviewUrl'],
            'handle' => $product['handle'],
        ]);
    }

}
