<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('change_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('related_id')->nullable();
            $table->string('event');
            $table->json('old_values')->nullable();
            $table->json('new_values');
            $table->timestamps();
            $table->string('updated_by')->default('gorocket');

            $table->index(['user_id', 'updated_by', 'created_at'], 'idx_user_updated_created');

            $table->index('product_id');
            $table->index('related_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('change_logs');
    }
};
