<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Redis;

class SyncController extends Controller
{
    /**
     * SyncController constructor.
     *
     * @param int $shopId
     * @return JsonResponse
     */
    public function getSyncStatus(int $shopId): JsonResponse
    {
        $syncKey = "shop:{$shopId}:product_sync";
        $syncStatus = Redis::hgetall($syncKey);

        if (empty($syncStatus)) {
            return response()->json([
                'syncing' => false
            ]);
        }

        return response()->json([
            'syncing'  => filter_var($syncStatus['syncing'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'progress' => intval($syncStatus['progress'] ?? 0),
            'bulking'  => intval($syncStatus['bulking'] ?? 0)
        ]);
    }
}
