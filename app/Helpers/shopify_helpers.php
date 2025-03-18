<?php

use Osiset\ShopifyApp\Contracts\Objects\Values\ShopDomain as ShopDomainValue;
use Illuminate\Support\Facades\Config;

if (! function_exists('getShopifyConfig')) {
    function getShopifyConfig(string $key, $shop)
    {
        $fullKey = "shopify-app.{$key}";
        if (! $shop) {
            return Config::get($fullKey);
        }

        $shopDomain = $shop instanceof ShopDomainValue ? $shop->toNative() : $shop;
        $shopDomain = preg_replace('/[^A-Z0-9]/', '', strtoupper(explode('.', $shopDomain)[0]));

        return env(strtoupper($key) . "_" . $shopDomain, Config::get($fullKey));
    }
}
