<?php

use App\Http\Controllers\ShopifyController;
use Illuminate\Support\Facades\Route;


//Route::get('/', function () {
//    return view('welcome');
//})->middleware(['verify.shopify'])->name('home');



Route::get('/', [ShopifyController::class, 'home'])->middleware(['verify.shopify'])->name('home');


Route::middleware(['auth.webhook'])->group(function () {
    Route::post('/handle/shop-update', [ShopifyController::class, 'handleShopUpdate']);
    Route::post('/handle/products-update', [ShopifyController::class, 'handleProductUpdate']);
});
