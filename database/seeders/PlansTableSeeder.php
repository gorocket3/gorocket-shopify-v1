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
        DB::table('plans')->insert([
            [
                'type' => 'RECURRING',
                'name' => 'Free',
                'price' => '0.00',
                'interval' => 'EVERY_30_DAYS',
                'capped_amount' => '0.00',
                'terms' => 'This plan is completely free.',
                'trial_days' => 0,
                'test' => 1,
                'on_install' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ],
            [
                'type' => 'RECURRING',
                'name' => 'Basic',
                'price' => '7.99',
                'interval' => 'EVERY_30_DAYS',
                'capped_amount' => '0.00',
                'terms' => 'Get full access to Basic features.',
                'trial_days' => 0,
                'test' => 1,
                'on_install' => 0,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ],
        ]);
    }
}
