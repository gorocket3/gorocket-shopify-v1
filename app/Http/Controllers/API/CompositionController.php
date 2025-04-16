<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class CompositionController extends Controller
{
    /**
     * Initialize the composition settings
     *
     * @return JsonResponse
     */
    public function init(): JsonResponse
    {
        $shop = Auth::user();

        $init = Product::where('user_id', $shop->id)
            ->select(['collections', 'category', 'product_type', 'vendor', 'status', 'tags'])
            ->get();

        return response()->json([
            'collection' => [
                'collections' => $init->pluck('collections')->unique()->values()
            ],
            'category' => [
                'categories' => $init->pluck('category')->unique()->values()
            ],
            'product_type' => [
                'product_types' => $init->pluck('product_type')->unique()->values()
            ],
            'vendor' => [
                'vendor' => $init->pluck('vendor')->unique()->values()
            ],
            'status' => [
                'status' => collect(['active', 'draft', 'archived'])->merge($init->pluck('status')->unique())->unique()->values()
            ],
            'tags' => [
                'tags' => $init->pluck('tags')->filter()->flatMap(fn($tagString) => explode(',', $tagString))
                    ->map(fn($tag) => trim($tag))->unique()->values()
            ]
        ]);
    }

    /**
     * Get all categories
     *
     * @return JsonResponse
     */
    public function category(): JsonResponse
    {
        $shop = Auth::user();

        $categories = Product::where('user_id', $shop->id)
            ->groupBy('category')
            ->pluck('category');

        return response()->json([
            'categories' => $categories
        ]);
    }

    /**
     * Get all collection
     *
     * @return JsonResponse
     */
    public function collection(): JsonResponse
    {
        $shop = Auth::user();

        $collections = Product::where('user_id', $shop->id)
            ->groupBy('collections')
            ->pluck('collections');

        return response()->json([
            'collections' => $collections
        ]);
    }

    /**
     * Get all product_types
     *
     * @return JsonResponse
     */
    public function product_type(): JsonResponse
    {
        $shop = Auth::user();

        $productTypes = Product::where('user_id', $shop->id)
            ->groupBy('product_type')
            ->pluck('product_type');

        return response()->json([
            'product_types' => $productTypes
        ]);
    }

    /**
     * Get all vendors
     *
     * @return JsonResponse
     */
    public function vendor(): JsonResponse
    {
        $shop = Auth::user();

        $vendors = Product::where('user_id', $shop->id)
            ->groupBy('vendor')
            ->pluck('vendor');

        return response()->json([
            'vendor' => $vendors
        ]);
    }

    /**
     * Get all tags
     *
     * @return JsonResponse
     */
    public function tags(): JsonResponse
    {
        $shop = Auth::user();

        $tags = Product::where('user_id', $shop->id)
            ->where('tags', '!=', '')->get()
            ->flatMap(function ($product) {
                return explode(',', $product->tags);
            })->map(function ($tag) {
                return trim($tag);
            })->unique()
            ->values();

        return response()->json([
            'tags' => $tags
        ]);
    }

    /**
     * Get all status
     *
     * @return JsonResponse
     */
    public function status(): JsonResponse
    {
        $shop = Auth::user();

        $existingStatuses = Product::where('user_id', $shop->id)
            ->groupBy('status')
            ->pluck('status')
            ->toArray();

        $defaultStatuses = ['active', 'draft', 'archived'];
        $statuses = array_values(array_unique(array_merge($defaultStatuses, $existingStatuses)));

        return response()->json([
            'status' => $statuses
        ]);
    }
}
