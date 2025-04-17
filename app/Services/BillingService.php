<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Osiset\ShopifyApp\Services\ChargeHelper;
use App\Models\User;
use Throwable;

class BillingService
{
    /**
     * The charge helper.
     *
     * @var ChargeHelper
     */
    protected ChargeHelper $chargeHelper;

    /**
     * Constructor to inject dependencies.
     */
    public function __construct(ChargeHelper $chargeHelper)
    {
        $this->chargeHelper = $chargeHelper;
    }

    /**
     * Check the billing status of all shops.
     * @throws Throwable
     */
    public function checkBillingStatus(): void
    {
        User::query()->whereNull('deleted_at')->chunk(100, function ($shops) {
            foreach ($shops as $shop) {
                $plan = $shop->plan;
                if ($plan === null) {
                    continue;
                }

                $charge = $this->chargeHelper->chargeForPlan($plan->getId(), $shop);
                if (!$charge) {
                    continue;
                }

                try {
                    $this->chargeHelper->useCharge($charge->getReference());
                    $chargeData = $this->chargeHelper->retrieve($shop);
                } catch (Throwable $e) {
                    if (str_contains($e->getMessage(), 'Not Found')) {
                        Log::warning("[COMMAND][BILLING] Shop {$shop->name}: Charge ID {$charge->charge_id} not found on Shopify. Skipping.");
                        return;
                    }
                    throw $e;
                }

                if (isset($chargeData['status'])) {
                    $newStatus = strtoupper($chargeData['status']);

                    if (strtoupper($charge->status) !== $newStatus) {
                        $charge->update([
                            'status' => $newStatus,
                            'updated_at' => now()
                        ]);

                        Log::info("[COMMAND][BILLING] Shop {$shop->name}: Charge ID {$charge->charge_id} status updated to '{$newStatus}'.");
                    }

                    if ($newStatus === 'CANCELLED' && $charge->expires_on && now()->greaterThan($charge->expires_on) && $shop->plan_id !== 1) {
                        $shop->update([
                            'plan_id' => 1,
                            'shopify_freemium' => 1
                        ]);

                        Log::info("[COMMAND][BILLING] Shop {$shop->name}: Plan expired and moved to free plan.");
                    }
                } else {
                    Log::warning("[COMMAND][BILLING] Shop {$shop->name}: Failed to retrieve status for Charge ID {$charge->charge_id}.");
                }
            }
        });
    }
}
