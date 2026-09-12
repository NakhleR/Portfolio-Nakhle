<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TimelineResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return ['id' => $this->mongo_id, '_id' => $this->mongo_id, ...$this->resource->only(['year', 'title', 'location', 'category', 'description', 'bullets', 'order']), 'createdAt' => $this->created_at?->toISOString(), 'updatedAt' => $this->updated_at?->toISOString()];
    }
}
