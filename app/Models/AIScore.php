<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @method static create(array $array)
 * @method static where(string $string, $id)
 */
class AIScore extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'ai_scores';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'product_id',
        'title_score',
        'description_score',
        'total_score',
        'grade',
        'checked_at'
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'checked_at' => 'datetime',
    ];

    /**
     * Get the shop that owns the Log
     *
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }
}
