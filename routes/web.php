<?php

use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth.webhook'])->group(function () {
    Route::post('handle/shop-update', [WebhookController::class, 'handleShopUpdate']);
    Route::post('handle/products-update', [WebhookController::class, 'handleProductUpdate']);
    Route::post('handle/products-delete', [WebhookController::class, 'handleProductDelete']);
    Route::post('handle/inventory-items-update', [WebhookController::class, 'handleInventoryItemsUpdate']);
    Route::post('handle/inventory-levels-update', [WebhookController::class, 'handleInventoryLevelsUpdate']);
    Route::post('handle/bulk-finish', [WebhookController::class, 'handleBulkFinish']);
});

Route::middleware(['verify.shopify', 'verify.scopes', 'billable'])->group(function () {
    Route::view('', 'index')->name('home');
    Route::view('products', 'index')->name('products');
    Route::view('plan', 'index')->name('plan');
    Route::view('history', 'index')->name('history');
});
