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

class CompositionController extends Controller
{
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
     * Get all collection
     *
     * @return JsonResponse
     */
    public function collection(): JsonResponse
    {
        $shop = Auth::user();

        $endpoint = '/admin/api/' . env('SHOPIFY_API_VERSION') . '/custom_collections.json';
        $response = $shop->api()->rest('GET', $endpoint);

        return response()->json($response['body']['custom_collections']);
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

        $status = Product::where('user_id', $shop->id)
            ->groupBy('status')
            ->pluck('status');

        return response()->json([
            'status' => $status
        ]);
    }
}
