<?php

namespace App\Jobs\Hook;

use App\Models\Shop;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ShopUpdateJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Shop data
     *
     * @var array
     */
    protected array $data;

    /**
     * Create a new job instance.
     *
     * @param array $data
     */
    public function __construct(array $data)
    {
        $this->data = $data;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle(): void
    {
        try {
            Shop::updateOrCreate(
                ['shop_id' => $this->data['id']],
                [
                    'myshopify_domain'               => $this->data['myshopify_domain'],
                    'name'                           => $this->data['name'],
                    'shop_owner'                     => $this->data['shop_owner'],
                    'email'                          => $this->data['email'],
                    'customer_email'                 => $this->data['customer_email'],
                    'domain'                         => $this->data['domain'],
                    'country'                        => $this->data['country'],
                    'country_code'                   => $this->data['country_code'],
                    'currency'                       => $this->data['currency'],
                    'timezone'                       => $this->data['timezone'],
                    'plan_name'                      => $this->data['plan_name'],
                    'plan_display_name'              => $this->data['plan_display_name'],
                    'has_storefront'                 => $this->data['has_storefront'],
                    'password_enabled'               => $this->data['password_enabled'],
                    'checkout_api_supported'         => $this->data['checkout_api_supported'],
                    'enabled_presentment_currencies' => $this->data['enabled_presentment_currencies'],
                    'multi_location_enabled'         => $this->data['multi_location_enabled'],
                    'shop_created_at'                => $this->data['created_at'],
                    'shop_updated_at'                => $this->data['updated_at'],
                    'updated_at'                     => now()
                ]
            );

            Log::info("[HOOK][SHOP] Update success - {$this->data['id']}");
        } catch (Exception $e) {
            Log::error("[HOOK][SHOP] Update failed - {$this->data['id']}, Error: {$e->getMessage()}");
        }
    }
}
