<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @method static updateOrCreate(array $array, array $array1)
 */
class Shop extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'shopify_id',
        'shopify_domain',
        'name',
        'shop_owner',
        'email',
        'customer_email',
        'myshopify_domain',
        'domain',
        'country',
        'country_code',
        'currency',
        'timezone',
        'plan_name',
        'plan_display_name',
        'has_storefront',
        'password_enabled',
        'checkout_api_supported',
        'enabled_presentment_currencies',
        'multi_location_enabled',
        'shop_created_at',
        'shop_updated_at',
        'created_at',
        'updated_at'
    ];

    /**
     * Get the user that owns the shop.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'myshopify_domain', 'name');
    }
}
