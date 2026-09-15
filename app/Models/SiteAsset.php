<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class SiteAsset extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $guarded = ['id'];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('portrait')->useDisk('public')->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])->singleFile();
        $this->addMediaCollection('cv')->useDisk('public')->acceptsMimeTypes(['application/pdf'])->singleFile();
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('display')->performOnCollections('portrait')->width(960)->format('webp')->nonOptimized()->nonQueued();
    }
}
