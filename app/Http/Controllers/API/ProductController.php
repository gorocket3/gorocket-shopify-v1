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
            'logs_count_min' => 'nullable|integer|min:0',
            'logs_count_max' => 'nullable|integer|min:0|gte:logs_count_min',
            'ai_generation_count_min' => 'nullable|integer|min:0',
            'ai_generation_count_max' => 'nullable|integer|min:0|gte:ai_generation_count_min',
            'title' => 'nullable|string|max:512',
            'content' => 'nullable|string',
            'collection' => 'nullable',
            'category' => 'nullable',
            'product_type' => 'nullable',
            'vendor' => 'nullable',
            'status' => 'nullable',
            'tags' => 'nullable',
            'tag_match' => 'nullable|string|in:any,all',
            'handle' => 'nullable|string|max:255',
            'option_name' => 'nullable|string|max:255',
            'price_min' => 'nullable|numeric',
            'price_max' => 'nullable|numeric|gte:price_min',
            'compare_at_price_min' => 'nullable|numeric',
            'compare_at_price_max' => 'nullable|numeric|gte:compare_at_price_min',
            'inventory_management' => 'nullable|string|max:255',
            'inventory_quantity_min' => 'nullable|integer',
            'inventory_quantity_max' => 'nullable|integer|gte:inventory_quantity_min',
            'inventory_policy' => 'nullable|string|max:255',
            'taxable' => 'nullable|boolean',
            'barcode' => 'nullable|string|max:255',
            'sku' => 'nullable|string|max:255',
            'requires_shipping' => 'nullable|boolean',
            'weight_min' => 'nullable|numeric',
            'weight_max' => 'nullable|numeric|gte:weight_min',
            'weight_unit' => 'nullable',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:255',
            'seo_grade' => 'nullable',
            'sort_by' => 'nullable|in:publish_at,created_at,updated_at,price,compare_at_price,inventory_quantity,grams',
            'sort_dir' => 'nullable|in:asc,desc',
            'product_img' => 'nullable|in:exists,none',
            'option_img' => 'nullable|in:exists,none'
        ]);

        $perPage = $validated['per_page'] ?? 50;
        $sortDir = $validated['sort_dir'] ?? 'desc';

        $sortableFields = [
            'publish_at' => 'products.publish_at',
            'created_at' => 'products.created_at',
            'updated_at' => 'products.updated_at',
            'price' => 'product_variants.price',
            'compare_at_price' => 'product_variants.compare_at_price',
            'inventory_quantity' => 'product_variants.inventory_quantity',
            'grams' => 'product_variants.grams'
        ];

        $sortBy = $validated['sort_by'] ?? 'created_at';
        $sortField = $sortableFields[$sortBy] ?? 'products.created_at';

        $productIdQuery = Product::select('products.product_id')->where('products.user_id', $shop->id);
        $joinedVariants = false;
        $shouldGroupBy = false;

        if ($this->needsJoin($validated, [
            'option_name',
            'price_min',
            'price_max',
            'compare_at_price_min',
            'compare_at_price_max',
            'inventory_management',
            'inventory_quantity_min',
            'inventory_quantity_max',
            'inventory_policy',
            'requires_shipping',
            'sku',
            'barcode',
            'weight_min',
            'weight_max',
            'weight_unit',
            'sort_by'
        ])) {
            $productIdQuery->leftJoin('product_variants', 'products.product_id', '=', 'product_variants.product_id');
            $joinedVariants = true;
            $shouldGroupBy = true;
        }

        if ($this->needsJoin($validated, ['option_img'])) {
            if (!$joinedVariants) {
                $productIdQuery->leftJoin('product_variants', 'products.product_id', '=', 'product_variants.product_id');
                $shouldGroupBy = true;
            }
            $productIdQuery->leftJoin('product_images', 'product_variants.image_id', '=', 'product_images.image_id');
        }

        if ($this->needsJoin($validated, ['logs_count_min', 'logs_count_max'])) {
            $productIdQuery->leftJoin('change_logs', 'products.product_id', '=', 'change_logs.product_id');
            $productIdQuery->selectRaw('COUNT(change_logs.id) as logs_count');
            $shouldGroupBy = true;
        }

        if ($this->needsJoin($validated, ['ai_generation_count_min', 'ai_generation_count_max'])) {
            $productIdQuery->leftJoin('ai_generations', 'products.product_id', '=', 'ai_generations.product_id');
            $productIdQuery->selectRaw('COUNT(ai_generations.id) as ai_generation_count');
            $shouldGroupBy = true;
        }

        if ($this->needsJoin($validated, ['seo_grade'])) {
            $productIdQuery->leftJoin('ai_scores', 'products.product_id', '=', 'ai_scores.product_id');
        }

        if ($shouldGroupBy) {
            $productIdQuery->groupBy('products.product_id');
        }

        $this->applyFilters($productIdQuery, $validated);
        $productIdQuery->orderBy($sortField, $sortDir);
        $paginatedIds = $productIdQuery->paginate($perPage);
        $productIds = $paginatedIds->pluck('product_id');

        if ($productIds->isEmpty()) {
            return response()->json([
                'data' => [],
                'current_page' => $paginatedIds->currentPage(),
                'last_page' => $paginatedIds->lastPage(),
                'per_page' => $paginatedIds->perPage(),
                'total' => $paginatedIds->total(),
                'from' => $paginatedIds->firstItem(),
                'to' => $paginatedIds->lastItem()
            ]);
        }

        $products = Product::with([
            'variants.image',
            'images',
            'options',
            'aiScore'
        ])
        ->withCount('logs')
        ->withCount('aiGeneration')
        ->whereIn('product_id', $productIds)
        ->orderByRaw("FIELD(product_id, " . $productIds->implode(',') . ")")
        ->get();

        return response()->json([
            'data' => $products,
            'current_page' => $paginatedIds->currentPage(),
            'last_page' => $paginatedIds->lastPage(),
            'per_page' => $paginatedIds->perPage(),
            'total' => $paginatedIds->total(),
            'from' => $paginatedIds->firstItem(),
            'to' => $paginatedIds->lastItem()
        ]);
    }

    /**
     * Check if the query needs a join based on the validated filters
     *
     * @param array $validated
     * @param array $keys
     * @return bool
     */
    private function needsJoin(array $validated, array $keys): bool
    {
        foreach ($keys as $key) {
            if ($key === 'sort_by') {
                if (isset($validated['sort_by']) && in_array($validated['sort_by'], ['price', 'compare_at_price', 'inventory_quantity', 'grams'])) {
                    return true;
                }
            } elseif (isset($validated[$key])) {
                return true;
            }
        }
        return false;
    }

    /**
     * Apply filters to the query
     *
     * @param mixed $query
     * @param array $filters
     */
    private function applyFilters(mixed $query, array $filters): void
    {
        $query->when($filters['title'] ?? null, fn($q, $title) => $q->where('products.title', 'LIKE', "%{$title}%"))
            ->when($filters['content'] ?? null, function ($q) use ($filters) {
                $content = $filters['content'];
                if ($content === '__BLANK__') {
                    $q->where(function ($query) {
                        $query->whereNull('body_html')->orWhere('body_html', '');
                    });
                } else {
                    $q->where('body_text', 'LIKE', "%{$content}%");
                }
            })

            ->when($filters['collection'] ?? null, function ($q, $collection) {
                if (is_array($collection)) {
                    $q->whereIn('collection', $collection);
                } else {
                    $q->where('collection', $collection);
                }
            })
            ->when($filters['category'] ?? null, function ($q, $category) {
                if (is_array($category)) {
                    $q->whereIn('category', $category);
                } else {
                    $q->where('category', $category);
                }
            })
            ->when($filters['product_type'] ?? null, function ($q, $type) {
                if (is_array($type)) {
                    $q->whereIn('product_type', $type);
                } else {
                    $q->where('product_type', $type);
                }
            })
            ->when($filters['vendor'] ?? null, function ($q, $vendor) {
                if (is_array($vendor)) {
                    $q->whereIn('vendor', $vendor);
                } else {
                    $q->where('vendor', $vendor);
                }
            })
            ->when($filters['status'] ?? null, function ($q, $status) {
                if (is_array($status)) {
                    $q->whereIn('status', $status);
                } else {
                    $q->where('status', $status);
                }
            })
            ->when($filters['tags'] ?? null, function ($q, $tags) use ($filters) {
                $tagsArray = is_array($tags) ? $tags : explode(',', $tags);
                $tagsArray = array_map(fn($tag) => trim(strtolower($tag)), $tagsArray);
                $q->where(function ($subQuery) use ($tagsArray, $filters) {
                    foreach ($tagsArray as $tag) {
                        $condition = 'FIND_IN_SET(?, LOWER(REPLACE(tags, ", ", ",")))';
                        if (($filters['tag_match'] ?? 'any') === 'all') {
                            $subQuery->whereRaw($condition, [$tag]);
                        } else {
                            $subQuery->orWhereRaw($condition, [$tag]);
                        }
                    }
                });
            })
            ->when($filters['handle'] ?? null, function ($q) use ($filters) {
                $handle = $filters['handle'];
                if ($handle === '__BLANK__') {
                    $q->where(function ($query) {
                        $query->whereNull('handle')->orWhere('handle', '');
                    });
                } else {
                    $q->where('handle', 'LIKE', "%{$handle}%");
                }
            })
            ->when($filters['option_name'] ?? null, fn($q, $optionName) => $q->where('product_variants.title', 'LIKE', "%{$optionName}%"))
            ->when($filters['price_min'] ?? null, fn($q, $priceMin) => $q->where('price', '>=', $priceMin))
            ->when($filters['price_max'] ?? null, fn($q, $priceMax) => $q->where('price', '<=', $priceMax))
            ->when($filters['compare_at_price_min'] ?? null, fn($q, $compareAtPriceMin) => $q->where('compare_at_price', '>=', $compareAtPriceMin))
            ->when($filters['compare_at_price_max'] ?? null, fn($q, $compareAtPriceMax) => $q->where('compare_at_price', '<=', $compareAtPriceMax))
            ->when(isset($filters['inventory_management']), function ($q) use ($filters) {
                if ($filters['inventory_management'] === 'shopify') {
                    $q->where('inventory_management', 'shopify');
                } else {
                    $q->where(function ($query) {
                        $query->where('inventory_management', '!=', 'shopify')->orWhereNull('inventory_management');
                    });
                }
            })
            ->when($filters['inventory_quantity_min'] ?? null, fn($q, $inventoryQuantityMin) => $q->where('inventory_quantity', '>=', $inventoryQuantityMin))
            ->when($filters['inventory_quantity_max'] ?? null, fn($q, $inventoryQuantityMax) => $q->where('inventory_quantity', '<=', $inventoryQuantityMax))
            ->when($filters['inventory_policy'] ?? null, fn($q, $inventoryPolicy) => $q->where('inventory_policy', $inventoryPolicy))
            ->when(isset($filters['taxable']), fn($q) => $q->where('taxable', $filters['taxable']))
            ->when($filters['barcode'] ?? null, function ($q) use ($filters) {
                $barcode = $filters['barcode'];
                if ($barcode === '__BLANK__') {
                    $q->where(function ($query) {
                        $query->whereNull('barcode')->orWhere('barcode', '');
                    });
                } else {
                    $q->where('barcode', 'LIKE', "%{$barcode}%");
                }
            })
            ->when(isset($filters['sku']), function ($q) use ($filters) {
                $sku = $filters['sku'];
                if ($sku === '__BLANK__') {
                    $q->where(function ($query) {
                        $query->whereNull('sku')->orWhere('sku', '');
                    });
                } else {
                    $q->where('sku', 'LIKE', "%{$sku}%");
                }
            })
            ->when(isset($filters['requires_shipping']), fn($q) => $q->where('requires_shipping', $filters['requires_shipping']))
            ->when($filters['weight_min'] ?? null, fn($q, $weightMin) => $q->where('weight', '>=', $weightMin))
            ->when($filters['weight_max'] ?? null, fn($q, $weightMax) => $q->where('weight', '<=', $weightMax))
            ->when($filters['weight_unit'] ?? null, function ($q, $weightUnit) {
                if (is_array($weightUnit)) {
                    $q->whereIn('weight_unit', $weightUnit);
                } else {
                    $q->where('weight_unit', $weightUnit);
                }
            })
            ->when($filters['seo_title'] ?? null, function ($q) use ($filters) {
                $seoTitle = $filters['seo_title'];
                if ($seoTitle === '__BLANK__') {
                    $q->where(function ($query) {
                        $query->whereNull('seo_title')->orWhere('seo_title', '');
                    });
                } else {
                    $q->where('seo_title', 'LIKE', "%{$seoTitle}%");
                }
            })
            ->when($filters['seo_description'] ?? null, function ($q) use ($filters) {
                $seoDescription = $filters['seo_description'];
                if ($seoDescription === '__BLANK__') {
                    $q->where(function ($query) {
                        $query->whereNull('seo_description')->orWhere('seo_description', '');
                    });
                } else {
                    $q->where('seo_description', 'LIKE', "%{$seoDescription}%");
                }
            })
            ->when($filters['seo_grade'] ?? null, function ($q, $grade) {
                $grades = is_array($grade) ? $grade : [$grade];
                $q->where(function ($query) use ($grades) {
                    if (in_array('bad', $grades)) {
                        $query->whereNull('ai_scores.product_id');
                    }
                    $validGrades = array_filter($grades, fn($g) => $g !== 'bad');
                    if (!empty($validGrades)) {
                        $query->orWhereIn('ai_scores.grade', $validGrades);
                    }
                });
            })
            ->when(isset($filters['product_img']), function ($q) use ($filters) {
                if ($filters['product_img'] === 'exists') {
                    $q->whereNotNull('products.featured_image');
                } else {
                    $q->whereNull('products.featured_image');
                }
            })
            ->when(isset($filters['option_img']), function ($q) use ($filters) {
                if ($filters['option_img'] === 'exists') {
                    $q->whereNotNull('product_images.src');
                } else {
                    $q->where(function ($query) {
                        $query->whereNull('product_images.src')->orWhereNull('product_variants.image_id');
                    });
                }
            })
            ->when($filters['logs_count_min'] ?? null, fn($q, $min) => $q->having('logs_count', '>=', $min))
            ->when($filters['logs_count_max'] ?? null, fn($q, $max) => $q->having('logs_count', '<=', $max))
            ->when($filters['ai_generation_count_min'] ?? null, fn($q, $min) => $q->having('ai_generation_count', '>=', $min))
            ->when($filters['ai_generation_count_max'] ?? null, fn($q, $max) => $q->having('ai_generation_count', '<=', $max));
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
                'product_ids' => $chunk,
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
