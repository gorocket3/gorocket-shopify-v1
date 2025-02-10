<?php

use App\Http\Controllers\API\ProductController;
use Illuminate\Support\Facades\Route;

//Route::middleware(['verify.shopify'])->group(function () {
    Route::get('products', [ProductController::class, 'list'])->name('products');
    Route::post('products/edit', [ProductController::class, 'edit'])->name('products.edit');
//});

