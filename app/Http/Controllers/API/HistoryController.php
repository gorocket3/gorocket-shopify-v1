<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ChangeLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redis;

class HistoryController extends Controller
{
    /**
     * limit daily requests
     */
    const FREE_MAX_DAILY_REQUESTS = 100;
    const BASIC_MAX_DAILY_REQUESTS = 50000;

    /**
     * SyncController constructor.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $shop = Auth::user();

        $validated = $request->validate([
            'per_page' => 'integer|min:1|max:1000',
            'product_id' => 'nullable'
        ]);

        $perPage = $validated['per_page'] ?? 50;

        $planName = $shop->plan->name ?? 'Free';
        $historyDays = match ($planName) {
            'Basic' => 30,
            default => 7
        };

        $query = ChangeLog::with([
            'product',
            'variant',
            'product.images',
            'variant.image',
        ])->where('user_id', $shop->id)->where('created_at', '>=', now()->subDays($historyDays));
        if (!empty($validated['product_id'])) {
            if (is_array($validated['product_id'])) {
                $query->whereIn('product_id', $validated['product_id']);
            } else {
                $query->where('product_id', $validated['product_id']);
            }
        }
        $history = $query->latest()->paginate($perPage);

        return response()->json($history);
    }

    /**
     * SyncController constructor.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function count(Request $request): JsonResponse
    {
        $shop = auth()->user();

        $query = ChangeLog::where('user_id', $shop->id)
            ->where('updated_by', 'gorocket')
            ->whereBetween('created_at', [now()->startOfDay(), now()->endOfDay()]);

        $limit = match ($shop->plan->name) {
            'Basic' => self::BASIC_MAX_DAILY_REQUESTS,
            default => self::FREE_MAX_DAILY_REQUESTS
        };

        return response()->json(['count' => $query->count(), 'limit' => $limit]);
    }
}
