<?php

use App\Http\Controllers\API\CompositionController;
use App\Http\Controllers\API\HistoryController;
use App\Http\Controllers\API\PersonalController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\SyncController;
use App\Http\Middleware\LimitProductEditMiddleware;
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
    Route::get('products/count', [ProductController::class, 'count'])->name('products.count');
    Route::post('products/sync', [ProductController::class, 'sync'])->middleware('throttle:1,60')->name('products.sync');
    Route::middleware([LimitProductEditMiddleware::class])->group(function () {
        Route::post('products/edit', [ProductController::class, 'edit'])->name('products.edit');
        Route::post('products/delete', [ProductController::class, 'delete'])->name('products.delete');
    });
    Route::get('products/check-handle', [ProductController::class, 'checkHandle'])->name('products.check-handle');

    // Personal-column
    Route::get('personal-column', [PersonalController::class, 'index'])->name('personal.column.index');
    Route::post('personal-column', [PersonalController::class, 'store'])->name('personal.column.store');
    Route::delete('personal-column', [PersonalController::class, 'destroy'])->name('personal.column.destroy');

    // Sync
    Route::get('sync-status/{shopId}', [SyncController::class, 'getSyncStatus'])->name('sync.status');

    // History
    Route::get('history', [HistoryController::class, 'index'])->name('history.list');
    Route::get('history/count', [HistoryController::class, 'count'])->name('history.count');
});

