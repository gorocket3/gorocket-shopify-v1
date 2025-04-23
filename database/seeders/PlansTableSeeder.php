<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PlansTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        $isTestMode = env('APP_ENV') !== 'production';

        DB::table('plans')->insert([
            [
                'type' => 'RECURRING',
                'name' => 'Free',
                'price' => '0.00',
                'interval' => 'EVERY_30_DAYS',
                'capped_amount' => '0.00',
                'terms' => 'This is a free plan with no cost.',
                'trial_days' => 0,
                'test' => $isTestMode ? 1 : 0,
                'on_install' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ],
            [
                'type' => 'RECURRING',
                'name' => 'Basic',
                'price' => '4.99',
                'interval' => 'EVERY_30_DAYS',
                'capped_amount' => '0.00',
                'terms' => 'Upgrade for faster editing and more AI SEO power.',
                'trial_days' => 0,
                'test' => $isTestMode ? 1 : 0,
                'on_install' => 0,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ],
            [
                'type' => 'RECURRING',
                'name' => 'Pro',
                'price' => '9.99',
                'interval' => 'EVERY_30_DAYS',
                'capped_amount' => '0.00',
                'terms' => 'Access generous usage limits built for growing businesses.',
                'trial_days' => 0,
                'test' => $isTestMode ? 1 : 0,
                'on_install' => 0,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ]
        ]);
    }
}
