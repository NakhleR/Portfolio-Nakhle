<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Timeline extends Model
{
    protected $guarded = ['id'];

    protected $dateFormat = 'Y-m-d H:i:s.v';

    protected $hidden = ['legacy_document'];

    protected function casts(): array
    {
        return ['bullets' => 'array', 'legacy_document' => 'array', 'order' => 'float'];
    }

    protected static function booted(): void
    {
        static::creating(fn (Timeline $timeline) => $timeline->mongo_id ??= (string) Str::uuid());
    }

    public function getRouteKeyName(): string
    {
        return 'mongo_id';
    }
}
