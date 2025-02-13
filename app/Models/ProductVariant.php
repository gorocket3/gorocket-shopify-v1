<?php

namespace App\Models;

use App\Jobs\App\ChangeLogJob;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @method static where(string $string, mixed $id)
 * @method static updateOrCreate(array $array, array $array1)
 */
class ProductVariant extends BaseModel
{
    /**
     * The "booting" method of the model.
     *
     * @return void
     */
    protected static function boot(): void
    {
        parent::boot();

        static::updating(function ($variant) {
            $dirty = $variant->getDirty();
            $original = $variant->getOriginal();

            unset($dirty['updated_at']);
            if (!empty($dirty)) {
                ChangeLogJob::dispatch([
                    'change_id' => self::getRequestChangeId(),
                    'product_id' => $variant->product_id,
                    'model_type' => get_class($variant),
                    'model_id' => $variant->variant_id,
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
    protected $table = 'product_variants';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'product_id',
        'variant_id',
        'title',
        'price',
        'position',
        'inventory_policy',
        'compare_at_price',
        'option1',
        'option2',
        'option3',
        'created_at',
        'updated_at',
        'taxable',
        'barcode',
        'fulfillment_service',
        'grams',
        'inventory_management',
        'requires_shipping',
        'sku',
        'weight',
        'weight_unit',
        'inventory_item_id',
        'inventory_quantity',
        'old_inventory_quantity',
        'admin_graphql_api_id',
        'image_id'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'price' => 'decimal:2',
        'compare_at_price' => 'decimal:2',
        'weight' => 'decimal:2',
        'taxable' => 'boolean',
        'requires_shipping' => 'boolean',
    ];

    /**
     * Get the product that owns the variant.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    /**
     * Get the image associated with the variant.
     */
    public function image(): HasOne
    {
        return $this->hasOne(ProductImage::class, 'image_id', 'image_id');
    }
}
