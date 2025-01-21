<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\BillingStatus as BillingStatusChecker;

class BillingStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'billing:check';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check billing status for all shops';

    /**
     * Execute the console command.
     *
     * @return void
     */
    public function handle(): void
    {
        $checker = new BillingStatusChecker();
        $checker->checkBillingStatus();

        $this->info('Billing status check completed.');
    }
}

