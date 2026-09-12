<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class ProjectCardResource extends ProjectResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);
        $data['images'] = array_slice($data['images']->all(), 0, 1);
        $data['imageVariants'] = array_slice($data['imageVariants']->all(), 0, 1);

        return Arr::only($data, ['id', 'title', 'category', 'description', 'technologies', 'images', 'imageVariants']);
    }
}
