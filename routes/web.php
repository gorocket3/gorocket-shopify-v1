<?php

use App\Http\Controllers\ProductController;
use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

Route::middleware(['verify.shopify', 'verify.scopes', 'billable'])->group(function () {
    Route::get('', fn() => view('welcome'))->name('home');
    Route::get('products', fn() => view('product.list'))->name('products');


    Route::get('help', [ProductController::class, 'test'])->name('test');

});


Route::middleware(['auth.webhook'])->group(function () {
    Route::post('handle/shop-update', [WebhookController::class, 'handleShopUpdate']);
    Route::post('handle/products-update', [WebhookController::class, 'handleProductUpdate']);
    Route::post('handle/products-delete', [WebhookController::class, 'handleProductDelete']);
});
