<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\ChangeLog;
use Osiset\ShopifyApp\Storage\Models\Charge;

class LimitProductEditMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): JsonResponse
    {
        $shop = auth()->user();
        if (!$shop) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $planName = $shop->plan->name ?? 'Free';
        $maxDailyRequests = config("plans.edit_limits.{$planName}", config('plans.edit_limits.Free'));

        $editCount = ChangeLog::where('user_id', $shop->id)
            ->where('updated_by', 'gorocket')
            ->whereBetween('created_at', [now()->startOfDay(), now()->endOfDay()])
            ->count();

        if ($editCount >= $maxDailyRequests) {
            return response()->json([
                'message' => "Daily limit exceeded: {$maxDailyRequests}"
            ], 429);
        }

        return $next($request);
    }
}
