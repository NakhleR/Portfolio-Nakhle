<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Project extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $guarded = ['id'];

    protected $dateFormat = 'Y-m-d H:i:s.v';

    protected $hidden = ['legacy_document'];

    protected function casts(): array
    {
        return ['technologies' => 'array', 'legacy_document' => 'array', 'order' => 'float'];
    }

    protected static function booted(): void
    {
        static::creating(fn (Project $project) => $project->mongo_id ??= (string) Str::uuid());
    }

    public function getRouteKeyName(): string
    {
        return 'mongo_id';
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('images')->useDisk('public')->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
    }
}
