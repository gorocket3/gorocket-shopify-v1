<?php

use Osiset\ShopifyApp\Contracts\Objects\Values\ShopDomain as ShopDomainValue;
use Illuminate\Support\Facades\Config;

if (! function_exists('getShopifyConfig')) {
    /**
     * @param string $key
     * @param $shop
     * @return mixed
     */
    function getShopifyConfig(string $key, $shop): mixed
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

if (! function_exists('gql_escape')) {
    /**
     * Escape string for GraphQL.
     */
    function gql_escape(?string $value): string
    {
        return substr(json_encode($value ?? '', JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), 1, -1);
    }
}
