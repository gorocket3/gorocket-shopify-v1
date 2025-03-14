<?php

namespace App\Models;

use App\Jobs\App\ChangeLogJob;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @method static where(string $string, mixed $id)
 * @method static updateOrCreate(array $array, array $array1)
 * @method static upsert(mixed[] $toArray, string[] $array)
 * @method static whereNotIn(string $string, \Illuminate\Support\Collection $optionIds)
 */
class ProductOption extends BaseModel
{
    /**
     * The "booting" method of the model.
     *
     * @return void
     */
    protected static function boot(): void
    {
        parent::boot();

        static::updating(function ($option) {
            $dirty = $option->getDirty();

            unset($dirty['updated_at']);
            $dirty = array_filter($dirty, function ($value) {
                return !is_null($value) && $value !== "";
            });

            if (!empty($dirty)) {
                ChangeLogJob::dispatch([
                    'change_id'     => self::getRequestChangeId(),
                    'product_id'    => $option->product_id,
                    'model_type'    => get_class($option),
                    'model_id'      => $option->option_id,
                    'old_data'      => json_encode(array_intersect_key($option->getOriginal(), $dirty)),
                    'new_data'      => json_encode($dirty)
                ]);
            }
        });
    }

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'product_options';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $fillable = [
        'product_id',
        'option_id',
        'name',
        'position',
        'values'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'values' => 'array'
    ];

    /**
     * Get the product that owns the option.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }
}
