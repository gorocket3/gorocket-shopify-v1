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
        Schema::create('ai_scores', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('product_id');
            $table->unsignedTinyInteger('title_score')->default(0);
            $table->unsignedTinyInteger('description_score')->default(0);
            $table->unsignedTinyInteger('total_score')->default(0);
            $table->string('grade')->default('poor');
            $table->timestamp('checked_at')->nullable();
            $table->timestamps();

            $table->unique(['product_id', 'user_id']);
            $table->index('grade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_scores');
    }
};
