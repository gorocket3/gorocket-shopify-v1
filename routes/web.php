<?php

use App\Http\Controllers\ProductController;
use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

Route::middleware(['verify.shopify', 'verify.scopes', 'billable'])->group(function () {
    Route::get('', fn() => view('welcome'))->name('home');
    Route::get('products', [ProductController::class, 'index'])->name('products');
    Route::get('pricing',  [PricingController::class, 'index'])->name('pricing');
    Route::get('settings', fn() => view('setting'))->name('settings');
    Route::get('help', [ProductController::class, 'test'])->name('test');
});


Route::middleware(['auth.webhook'])->group(function () {
    Route::post('handle/shop-update', [WebhookController::class, 'handleShopUpdate']);
    Route::post('handle/products-update', [WebhookController::class, 'handleProductUpdate']);
    Route::post('handle/products-delete', [WebhookController::class, 'handleProductDelete']);
});
