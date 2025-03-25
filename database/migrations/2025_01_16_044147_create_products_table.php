<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('product_id');
            $table->string('category')->nullable();
            $table->string('seo_title')->nullable();
            $table->string('seo_description')->nullable();
            $table->string('featured_image')->nullable();
            $table->string('title')->nullable();;
            $table->string('handle')->nullable();;
            $table->text('body_html')->nullable();
            $table->string('product_type')->nullable();
            $table->string('vendor')->nullable();
            $table->string('status')->default('active');
            $table->string('published_scope')->nullable();
            $table->string('tags')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->unsignedBigInteger('user_id');
            $table->string('updated_by')->default('gorocket');

            $table->index('user_id');
            $table->index('created_at');
            $table->index('updated_at');
            $table->index(['user_id', 'status']);

            $table->unique(['product_id', 'user_id']);
            $table->unique(['handle', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
