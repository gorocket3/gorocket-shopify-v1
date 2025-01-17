<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'user_id',
        'shop_id',
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
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'shop_created_at'                => 'datetime',
        'shop_updated_at'                => 'datetime',
        'enabled_presentment_currencies' => 'array',
        'has_storefront'                 => 'boolean',
        'password_enabled'               => 'boolean',
        'checkout_api_supported'         => 'boolean',
        'multi_location_enabled'         => 'boolean',
        'updated_at'                     => 'datetime'
    ];

    /**
     * Get the user that owns the shop.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * Get the products for the user.
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'user_id', 'user_id');
    }
}
