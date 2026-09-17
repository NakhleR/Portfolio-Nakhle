<?php

namespace App\Http\Resources;

use App\Services\Localization;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'is_published' => (bool) $this->is_published,
            'id' => $this->mongo_id, '_id' => $this->mongo_id,
            'title' => $this->title, 'category' => $this->category,
            'description' => $this->description, 'longDescription' => $this->longDescription,
            'technologies' => $this->technologies ?? [], 'liveUrl' => $this->liveUrl, 'githubUrl' => $this->githubUrl,
            'order' => $this->order,
            'images' => $this->getMedia('images')->map(fn ($media) => $media->getUrl())->values(),
            'imageVariants' => $this->getMedia('images')->map(fn ($media) => [
                'alt' => $media->getCustomProperty('alt', $this->title.' screenshot'),
                'src' => $media->getAvailableUrl(['display']),
                'srcset' => $media->hasGeneratedConversion('display') ? $media->getSrcset('display') : '',
            ])->values(),
            'media' => $this->getMedia('images')->map(fn ($media) => ['id' => $media->id, 'url' => $media->getUrl(), 'name' => $media->file_name, 'alt' => $media->getCustomProperty('alt', $this->title.' screenshot')])->values(),
            'createdAt' => $this->created_at?->toISOString(), 'updatedAt' => $this->updated_at?->toISOString(),
            ...app(Localization::class)->project($this->mongo_id),
        ];
    }
}
