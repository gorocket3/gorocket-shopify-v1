<?php
namespace App\Jobs\App;

use App\Models\ChangeLog;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ChangeLogJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Product data from webhook
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
     */
    public function handle(): void
    {
        try {
            $productId = $this->container['product_id'];
            ChangeLog::create($this->container);
        } catch (Exception $e) {
            Log::error("[HOOK][LOG] Create failed - {$productId}, Error: {$e->getMessage()}");
        }
    }
}
