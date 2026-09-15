<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CmsRevision extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return ['data' => 'array'];
    }
}
