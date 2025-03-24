<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

Route::middleware(['verify.shopify', 'verify.scopes', 'billable'])->group(function () {
    Route::get('', [DashboardController::class, 'index'])->name('home');
    Route::get('products', [ProductController::class, 'index'])->name('products');
    Route::get('plan',  [PlanController::class, 'index'])->name('plan');
    Route::get('history', fn() => view('history'))->name('history');
});


Route::middleware(['auth.webhook'])->group(function () {
    Route::post('handle/shop-update', [WebhookController::class, 'handleShopUpdate']);
    Route::post('handle/products-update', [WebhookController::class, 'handleProductUpdate']);
    Route::post('handle/products-delete', [WebhookController::class, 'handleProductDelete']);
    Route::post('handle/inventory-items-update', [WebhookController::class, 'handleInventoryItemsUpdate']);
    Route::post('handle/inventory-levels-update', [WebhookController::class, 'handleInventoryLevelsUpdate']);
    Route::post('handle/bulk-finish', [WebhookController::class, 'handleBulkFinish']);
});
