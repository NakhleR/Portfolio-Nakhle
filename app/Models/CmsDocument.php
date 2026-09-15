<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CmsDocument extends Model
{
    protected $primaryKey = 'key';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];

    protected function casts(): array
    {
        return ['version' => 'integer', 'draft' => 'array', 'published' => 'array', 'published_at' => 'datetime'];
    }
}
