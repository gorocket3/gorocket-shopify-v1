<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class BaseModel extends Model
{
    /**
     * The "booting" method of the model.
     *
     * @return void
     */
    protected static ?string $requestChangeId = null;

    /**
     * Get the request change id.
     *
     * @return string
     */
    public static function getRequestChangeId(): string
    {
        self::$requestChangeId = str_replace('-', '', Str::uuid());
        return static::$requestChangeId;
    }
}
