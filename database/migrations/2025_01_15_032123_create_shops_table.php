<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('shops', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('shop_id')->unique();
            $table->string('name');
            $table->string('shop_owner')->nullable();
            $table->string('email')->nullable();
            $table->string('customer_email')->nullable();
            $table->string('myshopify_domain')->unique();
            $table->string('domain')->nullable();
            $table->string('country')->nullable();
            $table->string('country_code', 10)->nullable();
            $table->string('currency', 10)->nullable();
            $table->string('timezone')->nullable();
            $table->string('plan_name')->nullable();
            $table->string('plan_display_name')->nullable();
            $table->boolean('has_storefront')->default(false);
            $table->boolean('password_enabled')->default(false);
            $table->boolean('checkout_api_supported')->default(false);
            $table->json('enabled_presentment_currencies')->nullable();
            $table->boolean('multi_location_enabled')->default(false);
            $table->timestamp('shop_created_at')->nullable();
            $table->timestamp('shop_updated_at')->nullable();
            $table->timestamps();
            $table->unsignedBigInteger('user_id')->unique();


        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shops');
    }
};
