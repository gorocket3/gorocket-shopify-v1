<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Osiset\ShopifyApp\Services\ChargeHelper;
use App\Models\User;

class BillingStatus
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
     */
    public function checkBillingStatus(): void
    {
        $shops = User::all();

        foreach ($shops as $shop) {
            $plan = $shop->plan;
            if ($plan === null) {
                continue;
            }

            $charge = $this->chargeHelper->chargeForPlan($plan->getId(), $shop);
            if (!$charge) {
                continue;
            }

            $this->chargeHelper->useCharge($charge->getReference());

            $chargeData = $this->chargeHelper->retrieve($shop);
            if (isset($chargeData['status'])) {
                $newStatus = strtoupper($chargeData['status']);
                if (strtoupper($charge->status) !== $newStatus) {
                    $charge->update([
                        'status' => $newStatus,
                        'updated_at' => now()
                    ]);

                    if (strtoupper('active') !== $newStatus) {
                        $shop->update([
                            'plan_id' => null,
                            'shopify_freemium' => 1
                        ]);
                    }

                    Log::info("[COMMAND][BILLING] Shop {$shop->name}: Charge ID {$charge->charge_id} status updated to '{$newStatus}'.");
                }
            } else {
                Log::warning("[COMMAND][BILLING] Shop {$shop->name}: Failed to retrieve status for Charge ID {$charge->charge_id}.");
            }
        }
    }
}
