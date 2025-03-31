<?php

namespace App\Jobs\Hook;

use App\Models\ProductVariant;
use Carbon\Carbon;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class InventoryItemsUpdateJob implements ShouldQueue
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
            $variant = ProductVariant::where('inventory_item_id', $this->data['id'])->first();

            if (!$variant) {
                if ($this->attempts() < 3) {
                    Log::info("[HOOK][INVENTORY] Variant not found - {$this->attempts()} - {$this->data['id']}");
                    $this->release(5);
                } else {
                    Log::warning("[HOOK][INVENTORY] Variant not found after retries - {$this->data['id']}");
                }
                return;
            }

            $variant->update([
                'sku'                   => $this->data['sku'],
                'requires_shipping'     => $this->data['requires_shipping'],
                'inventory_management'  => $this->data['tracked'] === true ? 'shopify' : null,
                'weight'                => $this->data['weight_value'],
                'weight_unit'           => $this->data['weight_unit'],
                'updated_at'            => Carbon::parse($this->data['updated_at'])->setTimezone('UTC')
            ]);

            Log::info("[HOOK][INVENTORY] Update success - {$this->data['id']}");
        } catch (Exception $e) {
            Log::error("[HOOK][INVENTORY] Update failed - {$this->data['id']}, Error: {$e->getMessage()}");
        }
    }
}
