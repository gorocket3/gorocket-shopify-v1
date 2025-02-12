<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Log;
use Osiset\ShopifyApp\Objects\Values\ShopDomain;

class CustomersRedactJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Shop's myshopify domain
     *
     * @var ShopDomain
     */
    public ShopDomain $shopDomain;

    /**
     * The webhook data
     *
     * @var object
     */
    public object $data;

    /**
     * Create a new job instance.
     *
     * @param ShopDomain $shopDomain The shop's myshopify domain
     * @param object     $data       The webhook data (JSON decoded)
     *
     * @return void
     */
    public function __construct(ShopDomain $shopDomain, object $data)
    {
        $this->shopDomain = $shopDomain;
        $this->data = $data;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle(): void
    {
        Log::info("[GDPR] customers/redact - {$this->shopDomain->toNative()}");
    }
}
