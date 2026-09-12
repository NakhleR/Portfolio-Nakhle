<?php

namespace App\Http\Controllers;

use App\Http\Requests\UploadRequest;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaController extends Controller
{
    public function store(UploadRequest $request, Project $project): JsonResponse
    {
        $media = $project->addMediaFromRequest('file')->toMediaCollection('images');

        return response()->json(['id' => $media->id, 'url' => $media->getUrl()], 201);
    }

    public function destroy(Project $project, Media $media): JsonResponse
    {
        abort_unless($media->model_type === $project->getMorphClass() && $media->model_id === $project->id && $media->collection_name === 'images', 404);
        $media->delete();

        return response()->json(['success' => true]);
    }
}
