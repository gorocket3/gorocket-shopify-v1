<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\AIGeneration;

class LimitAIUseMiddleware
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
        $maxDailyRequests = config("plans.ai_limits.{$planName}", config('plans.ai_limits.Free'));

        [$startDay, $endDay] = user_daily_utc_range($shop->shop->timezone);

        $todayCount = AIGeneration::where('user_id', $shop->id)
            ->whereBetween('created_at', [$startDay, $endDay])
            ->count();

        if ($todayCount >= $maxDailyRequests) {
            return response()->json([
                'message' => "Daily AI usage limit exceeded: {$maxDailyRequests}"
            ], 429);
        }

        return $next($request);
    }
}
