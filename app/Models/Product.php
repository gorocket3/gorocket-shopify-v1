<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @method static updateOrCreate(array $array, array $array1)
 * @method static where(string $string, mixed $admin_graphql_api_id)
 */
class Product extends Model
{
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
    ];
}
