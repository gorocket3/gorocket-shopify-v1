<?php

use App\Http\Controllers\API\ProductController;
use Illuminate\Support\Facades\Route;

//Route::middleware(['verify.shopify'])->group(function () {
    Route::get('products/list', [ProductController::class, 'list'])->name('products.list');
    Route::post('products/sync', [ProductController::class, 'sync'])->name('products.sync');


    Route::delete('products/delete', [ProductController::class, 'delete'])->name('products.delete');

    Route::post('products/edit', [ProductController::class, 'edit'])->name('products.edit');
//});

