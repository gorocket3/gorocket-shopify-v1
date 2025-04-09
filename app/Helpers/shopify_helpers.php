<?php

use Carbon\Carbon;
use Osiset\ShopifyApp\Contracts\Objects\Values\ShopDomain as ShopDomainValue;
use Illuminate\Support\Facades\Config;

if (! function_exists('getShopifyConfig')) {
    /**
     * Get the Shopify config value for a given key.
     *
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
     *
     * @param string|null $value
     * @return string
     */
    function gql_escape(?string $value): string
    {
        return substr(json_encode($value ?? '', JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), 1, -1);
    }
}

if (! function_exists('user_daily_utc_range')) {
    /**
     * Get the start and end of the user's day in UTC.
     *
     * @param string|null $rawTimezone
     * @return array
     */
    function user_daily_utc_range(?string $rawTimezone): array
    {
        $timezone = preg_replace('/^\(GMT[+-]\d{2}:\d{2}\)\s*/', '', $rawTimezone ?? '') ?: 'UTC';

        try {
            $start = Carbon::now($timezone)->startOfDay()->timezone('UTC');
            $end = Carbon::now($timezone)->endOfDay()->timezone('UTC');
        } catch (\Exception $e) {
            $start = Carbon::now('UTC')->startOfDay();
            $end = Carbon::now('UTC')->endOfDay();
        }

        return [$start, $end];
    }
}

