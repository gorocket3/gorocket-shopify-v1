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
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('variant_id');
            $table->string('title')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->integer('position')->nullable();
            $table->string('inventory_policy')->nullable();
            $table->decimal('compare_at_price', 10, 2)->nullable();
            $table->string('option1')->nullable();
            $table->string('option2')->nullable();
            $table->string('option3')->nullable();
            $table->boolean('taxable')->default(true);
            $table->string('barcode')->nullable();
            $table->string('fulfillment_service')->nullable();
            $table->integer('grams')->nullable();
            $table->string('inventory_management')->nullable();
            $table->boolean('requires_shipping')->default(true);
            $table->string('sku')->nullable();
            $table->decimal('weight', 10, 2)->nullable();
            $table->string('weight_unit')->nullable();
            $table->unsignedBigInteger('inventory_item_id');
            $table->integer('inventory_quantity')->nullable();
            $table->integer('old_inventory_quantity')->nullable();
            $table->unsignedBigInteger('image_id')->nullable();
            $table->timestamps();
            $table->string('updated_by')->default('gorocket');

            $table->foreign('product_id')->references('product_id')->on('products')->onDelete('cascade');

            $table->unique('variant_id');

            $table->index('product_id');
            $table->index('inventory_item_id');
            $table->index('price');
            $table->index('inventory_quantity');
            $table->index('sku');
            $table->index('image_id');
            $table->index('grams');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
