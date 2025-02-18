<?php

use App\Http\Controllers\API\CompositionController;
use App\Http\Controllers\API\ProductController;
use Illuminate\Support\Facades\Route;

Route::middleware(['verify.shopify'])->group(function () {

    // Composition
    Route::get('composition/product-type', [CompositionController::class, 'product_type'])->name('product-type.list');
    Route::get('composition/vendor', [CompositionController::class, 'vendor'])->name('vendor.list');
    Route::get('composition/collection', [CompositionController::class, 'collection'])->name('collection.list');
    Route::get('composition/tags', [CompositionController::class, 'tags'])->name('tag.list');
    Route::get('composition/status', [CompositionController::class, 'status'])->name('status.list');

    // Product
    Route::get('products', [ProductController::class, 'list'])->name('products.list');
    Route::post('products/sync', [ProductController::class, 'sync'])->name('products.sync');
    Route::post('products/edit', [ProductController::class, 'edit'])->name('products.edit');
    Route::delete('products/delete', [ProductController::class, 'delete'])->name('products.delete');
});

