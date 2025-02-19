<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @method static create(array $array)
 * @method static where(string $string, $id)
 * @method static updateOrCreate(int[] $array, array $validated)
 */
class PersonalColumn extends Model
{

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'personal_columns';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_yn',
        'columns',
        'user_id'
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'columns' => 'array'
    ];

    /**
     * Get the shop that owns the Log
     *
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
