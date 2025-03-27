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
        $planName  = $shop->plan->name ?? 'Free';
        $daysLimit = config("plans.history_days.{$planName}", config("plans.history_days.Free"));

        $cutoffDate = now()->subDays($daysLimit)->startOfDay();

        $query = ChangeLog::with([
            'product',
            'variant',
            'product.images',
            'variant.image',
        ])->where('user_id', $shop->id);

        if (!empty($validated['product_id'])) {
            if (is_array($validated['product_id'])) {
                $query->whereIn('product_id', $validated['product_id']);
            } else {
                $query->where('product_id', $validated['product_id']);
            }
        }

        $history = $query->latest()->paginate($perPage);

        $filteredItems = $history->getCollection()->map(function ($item) use ($cutoffDate, $planName) {
            if ($item->created_at < $cutoffDate || ($item->updated_by === 'shopify' && $planName === 'Free')) {
                $item->old_values = '';
                $item->new_values = '';
            }
            return $item;
        });

        $history->setCollection($filteredItems);

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

        $planName = $shop->plan->name ?? 'Free';
        $limit = config("plans.edit_limits.{$planName}", config("plans.edit_limits.Free"));

        return response()->json(['count' => $query->count(), 'limit' => $limit]);
    }
}
