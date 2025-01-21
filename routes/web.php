<?php

use App\Http\Controllers\ProductController;
use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

Route::middleware(['verify.shopify', 'billable'])->group(function () {
    Route::get('/', fn() => view('welcome'))->name('home');
    Route::get('/products', [ProductController::class, 'index'])->name('products.list');
});


Route::middleware(['auth.webhook'])->group(function () {
    Route::post('/handle/shop-update', [WebhookController::class, 'handleShopUpdate']);
    Route::post('/handle/products-update', [WebhookController::class, 'handleProductUpdate']);
    Route::post('/handle/products-delete', [WebhookController::class, 'handleProductDelete']);
});
