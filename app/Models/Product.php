<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\hasMany;

/**
 * @method static updateOrCreate(array $array, array $array1)
 * @method static where(string $string, mixed $product_id)
 * @method static orderBy(string $string, string $string1)
 * @method static find(mixed $id)
 * @method static upsert(mixed[] $toArray, string[] $array)
 * @method static whereIn(string $string, mixed $productIds)
 */
class Product extends BaseModel
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'product_id',
        'title',
        'handle',
        'body_html',
        'product_type',
        'vendor',
        'status',
        'published_scope',
        'tags',
        'published_at',
        'created_at',
        'updated_at',
        'user_id',
        'updated_by'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'published_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Get the user that owns the product.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * Get the shop that owns the product.
     */
    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class, 'user_id', 'user_id');
    }

    /**
     * Get the variants associated with the product.
     */
    public function variants(): hasMany
    {
        return $this->hasMany(ProductVariant::class, 'product_id', 'product_id');
    }

    /**
     * Get the image associated with the product.
     */
    public function images(): hasMany
    {
        return $this->hasMany(ProductImage::class, 'product_id', 'product_id');
    }

    /**
     * Get the variants associated with the product.
     */
    public function options(): hasMany
    {
        return $this->hasMany(ProductOption::class, 'product_id', 'product_id');
    }

    /**
     * Get the logs associated with the product.
     */
    public function logs(): hasMany
    {
        return $this->hasMany(ChangeLog::class, 'product_id', 'product_id');
    }
}
