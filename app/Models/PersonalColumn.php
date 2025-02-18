<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @method static create(array $array)
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
     * Get the shop that owns the Log
     *
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
