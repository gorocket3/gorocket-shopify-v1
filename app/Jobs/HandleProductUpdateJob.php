<?php
namespace App\Jobs;

use App\Models\Shop;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class HandleProductUpdateJob implements ShouldQueue
{
    /**
     * Traits
     */
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Shop data
     *
     * @var array
     */
    protected array $container;

    /**
     * Create a new job instance.
     *
     * @param array $container
     */
    public function __construct(array $container)
    {
        $this->container = $container;
    }

    /**
     * Execute the job.
     *
     * This method is used to handle the shop update job.
     * @return void
     */
    public function handle(): void
    {
        Shop::updateOrCreate(
            ['myshopify_domain' => $this->container['myshopify_domain']],
            [
                'shopify_id' => $this->container['id'],
                'name' => $this->container['name'],
                'shop_owner' => $this->container['shop_owner'],
                'email' => $this->container['email'],
                'customer_email' => $this->container['customer_email'],
                'domain' => $this->container['domain'],
                'country' => $this->container['country'],
                'country_code' => $this->container['country_code'],
                'currency' => $this->container['currency'],
                'timezone' => $this->container['timezone'],
                'plan_name' => $this->container['plan_name'],
                'plan_display_name' => $this->container['plan_display_name'],
                'has_storefront' => $this->container['has_storefront'],
                'password_enabled' => $this->container['password_enabled'],
                'checkout_api_supported' => $this->container['checkout_api_supported'],
                'enabled_presentment_currencies' => json_encode($this->container['enabled_presentment_currencies']),
                'multi_location_enabled' => $this->container['multi_location_enabled'],
                'shop_created_at' => Carbon::parse($this->container['created_at'])->timezone('UTC')->format('Y-m-d H:i:s'),
                'shop_updated_at' => Carbon::parse($this->container['updated_at'])->timezone('UTC')->format('Y-m-d H:i:s'),
                'updated_at' => now()
            ]
        );
    }
}
