<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redis;

class SyncController extends Controller
{
    /**
     * SyncController constructor.
     *
     * @return JsonResponse
     */
    public function getSyncStatus(): JsonResponse
    {
        $shop = Auth::user();

        $syncKey = "shop:{$shop->id}:product_sync";
        $syncStatus = Redis::hgetall($syncKey);

        if (empty($syncStatus)) {
            return response()->json([
                'shop_id'  => $shop->id,
                'syncing' => false
            ]);
        }

        return response()->json([
            'shop_id'  => $shop->id,
            'syncing'  => filter_var($syncStatus['syncing'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'progress' => intval($syncStatus['progress'] ?? 0),
            'bulking'  => intval($syncStatus['bulking'] ?? 0)
        ]);
    }
}
