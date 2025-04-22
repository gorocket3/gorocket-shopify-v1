<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ChangeLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HistoryController extends Controller
{
    /**
     * API endpoint to retrieve the history of changes for a shop.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $shop = Auth::user();

        $validated = $request->validate([
            'per_page' => 'integer|min:1|max:1000',
            'product_id' => 'nullable',
            'updated_by' => 'nullable|in:shopify,gorocket'
        ]);

        $perPage = $validated['per_page'] ?? 50;
        $planName  = $shop->plan->name ?? 'Free';
        $daysLimit = config("plans.history_days.{$planName}", config("plans.history_days.Free"));

        $timezoneRaw = $shop->shop->timezone ?? 'UTC';
        $timezone = preg_replace('/^\(GMT[+-]\d{2}:\d{2}\)\s*/', '', $timezoneRaw) ?: 'UTC';

        $cutoffDate = now($timezone)->subDays($daysLimit)->startOfDay()->timezone('UTC');

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

        if (!empty($validated['updated_by'])) {
            $query->where('updated_by', $validated['updated_by']);
        }

        $history = $query->latest()->paginate($perPage);

        $filteredItems = $history->getCollection()->map(function ($item) use ($cutoffDate, $planName) {
            if ($item->created_at < $cutoffDate || ($item->updated_by === 'shopify' && $planName === 'Free')) {
                $item->old_values = '';
                $item->new_values = '';
                return $item;
            }

            $productImages = collect($item->product?->images ?? []);

            $old = json_decode($item->old_values ?? '{}', true);
            $new = json_decode($item->new_values ?? '{}', true);

            foreach ([ 'old' => &$old, 'new' => &$new ] as $type => &$values) {
                if (array_key_exists('image_id', $values)) {
                    $img = $productImages->firstWhere('image_id', $values['image_id']);
                    $values['variant_image'] = $img['src'] ?? null;
                    unset($values['image_id']);
                }
            }

            $item->old_values = $old;
            $item->new_values = $new;

            return $item;
        });

        $history->setCollection($filteredItems);

        return response()->json($history);
    }

    /**
     * API endpoint to count the number of History logs for a shop.
     *
     * @return JsonResponse
     */
    public function count(): JsonResponse
    {
        $shop = auth()->user();

        [$startDay, $endDay] = user_daily_utc_range($shop->shop->timezone);

        $query = ChangeLog::where('user_id', $shop->id)
            ->where('updated_by', 'gorocket')
            ->whereBetween('created_at', [$startDay, $endDay]);

        $planName = $shop->plan->name ?? 'Free';
        $limit = config("plans.edit_limits.{$planName}", config("plans.edit_limits.Free"));

        return response()->json(['count' => $query->count(), 'limit' => $limit]);
    }
}
