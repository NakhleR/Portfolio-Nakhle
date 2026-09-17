<?php

namespace App\Http\Resources;

use App\Services\Localization;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

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
                ...$this->dimensions($media),
                'alt' => $media->getCustomProperty('alt', $this->title.' screenshot'),
                'src' => $media->getAvailableUrl(['display']),
                'srcset' => $media->hasGeneratedConversion('display') ? $media->getSrcset('display') : '',
            ])->values(),
            'media' => $this->getMedia('images')->map(fn ($media) => ['id' => $media->id, 'url' => $media->getUrl(), 'name' => $media->file_name, 'alt' => $media->getCustomProperty('alt', $this->title.' screenshot')])->values(),
            'createdAt' => $this->created_at?->toISOString(), 'updatedAt' => $this->updated_at?->toISOString(),
            ...app(Localization::class)->project($this->mongo_id),
        ];
    }

    /** @return array{width: ?int, height: ?int} */
    private function dimensions(Media $media): array
    {
        $responsive = $media->responsiveImages('display')->files->first();
        $saved = $media->getCustomProperty('dimensions', []);
        $width = (int) ($responsive?->width() ?? $saved['width'] ?? 0);
        $height = (int) ($responsive?->height() ?? $saved['height'] ?? 0);

        return $width > 0 && $height > 0
            ? ['width' => $width, 'height' => $height]
            : ['width' => null, 'height' => null];
    }
}
