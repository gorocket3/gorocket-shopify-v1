<?php

use App\Http\Controllers\API\CompositionController;
use App\Http\Controllers\API\PersonalController;
use App\Http\Controllers\API\ProductController;
use Illuminate\Support\Facades\Route;

Route::middleware(['verify.shopify'])->group(function () {

    // Composition
    Route::get('composition/product-type', [CompositionController::class, 'product_type'])->name('composition.product-type.list');
    Route::get('composition/vendor', [CompositionController::class, 'vendor'])->name('composition.vendor.list');
    Route::get('composition/collection', [CompositionController::class, 'collection'])->name('composition.collection.list');
    Route::get('composition/tags', [CompositionController::class, 'tags'])->name('composition.tag.list');
    Route::get('composition/status', [CompositionController::class, 'status'])->name('composition.status.list');

    // Product
    Route::get('products', [ProductController::class, 'list'])->name('products.list');
    Route::post('products/sync', [ProductController::class, 'sync'])->name('products.sync');
    Route::post('products/edit', [ProductController::class, 'edit'])->name('products.edit');
    Route::delete('products/delete', [ProductController::class, 'delete'])->name('products.delete');

    // Personal-column
    Route::get('personal-column', [PersonalController::class, 'index'])->name('personal.column.index');
    Route::post('personal-column', [PersonalController::class, 'store'])->name('personal.column.store');
    Route::delete('personal-column', [PersonalController::class, 'destroy'])->name('personal.column.destroy');
});

