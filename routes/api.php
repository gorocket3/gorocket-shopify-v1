<?php

use App\Http\Controllers\API\ProductController;
use Illuminate\Support\Facades\Route;

Route::middleware(['verify.shopify'])->group(function () {
    Route::get('products', [ProductController::class, 'list'])->name('products');
    Route::get('products/sync', [ProductController::class, 'sync'])->name('products.sync');
    Route::post('products/edit', [ProductController::class, 'edit'])->name('products.edit');
});

