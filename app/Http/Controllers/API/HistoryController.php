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

        $query = ChangeLog::where('user_id', $shop->id);
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
}
