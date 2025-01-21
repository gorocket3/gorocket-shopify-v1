<?php

namespace App\Listeners;

use App\Models\User;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Osiset\ShopifyApp\Messaging\Events\AppInstalledEvent;
use Osiset\ShopifyApp\Storage\Models\Plan;

class PlanUpdateListener implements ShouldQueue
{
    /**
     * The number of times the job may be attempted.
     */
    use InteractsWithQueue;

    /**
     * Handle the app installed event.
     *
     * @param AppInstalledEvent $event
     * @return void
     */
    public function handle(AppInstalledEvent $event): void
    {
        try {
            $shopId = $event->shopId->toNative();
            $shop = User::find($shopId);

            if (!$shop) {
                Log::error("[LISTENER][PLAN] Shop not found - {$shopId}");
                return;
            }

            $plan = Plan::where('on_install', 1)->first();
            if (!$plan) {
                Log::error("[LISTENER][PLAN] Plan not found - {$shopId}");
                return;
            }
            $shop->plan_id = $plan->id;
            $shop->save();

            Log::info("[LISTENER][PLAN] Queued success - {$shopId}");
        } catch (Exception $e) {
            Log::error("[LISTENER][PLAN] Queue failed - {$shopId}, Error: {$e->getMessage()}");
        }
    }
}
