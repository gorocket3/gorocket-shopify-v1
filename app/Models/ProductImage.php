<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @method static updateOrCreate(array $array, array $array1)
 * @method static where(string $string, mixed $id)
 */
class ProductImage extends BaseModel
{
    /**
     * The "booting" method of the model.
     *
     * @return void
     */
    protected static function boot(): void
    {
        parent::boot();

        static::updating(function ($image) {
            $dirty = $image->getDirty();
            $original = $image->getOriginal();

            unset($dirty['updated_at']);

            if (!empty($dirty)) {
                ChangeLog::create([
                    'change_id' => self::getRequestChangeId(),
                    'product_id' => $image->product_id,
                    'model_type' => get_class($image),
                    'model_id' => $image->image_id,
                    'old_data' => json_encode(array_intersect_key($original, $dirty)),
                    'new_data' => json_encode($dirty)
                ]);
            }
        });
    }

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'product_images';

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

    /**
     * Get the variant that owns the image.
     */
    public function variant(): HasOne
    {
        return $this->hasOne(ProductVariant::class, 'image_id', 'image_id');
    }
}
