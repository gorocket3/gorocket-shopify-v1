<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\hasMany;

/**
 * @method static updateOrCreate(array $array, array $array1)
 * @method static where(string $string, mixed $admin_graphql_api_id)
 * @method static orderBy(string $string, string $string1)
 * @method static find(mixed $id)
 */
class Product extends Model
{
    /**
     * The "booting" method of the model.
     *
     * @return void
     */
    protected static function boot(): void
    {
        parent::boot();

        static::updating(function ($product) {
            $dirty = $product->getDirty();
            $original = $product->getOriginal();

            unset($dirty['updated_at']);

            if (!empty($dirty)) {
                HistoryLog::create([
                    'product_id' => $product->product_id,
                    'model_type' => get_class($product),
                    'model_id' => $product->id,
                    'old_data' => json_encode(array_intersect_key($original, $dirty)),
                    'new_data' => json_encode($dirty)
                ]);
            }
        });
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'product_id',
        'admin_graphql_api_id',
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
        'user_id'
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
        return $this->hasMany(HistoryLog::class, 'product_id', 'product_id');
    }
}
