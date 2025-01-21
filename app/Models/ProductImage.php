<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @method static updateOrCreate(array $array, array $array1)
 * @method static where(string $string, mixed $id)
 */
class ProductImage extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'product_image';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $fillable = [
        'product_id',
        'image_id',
        'alt',
        'position',
        'src',
        'width',
        'height',
        'admin_graphql_api_id',
        'variant_ids'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'variant_ids' => 'array'
    ];

    /**
     * Get the product that owns the image.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }
}
