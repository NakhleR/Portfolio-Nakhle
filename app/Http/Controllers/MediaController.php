<?php

namespace App\Http\Controllers;

use App\Http\Requests\UploadRequest;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaController extends Controller
{
    public function store(UploadRequest $request, Project $project): JsonResponse
    {
        $extension = match ($request->file('file')->getMimeType()) {
            'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp',
            'image/gif' => 'gif', 'image/avif' => 'avif',
        };
        $media = $project->addMediaFromRequest('file')
            ->usingFileName(Str::uuid().'.'.$extension)
            ->toMediaCollection('images');

        return response()->json(['id' => $media->id, 'url' => $media->getUrl()], 201);
    }

    public function update(Request $request, Project $project, Media $media): JsonResponse
    {
        abort_unless($media->model_type === $project->getMorphClass() && $media->model_id === $project->id && $media->collection_name === 'images', 404);
        $data = $request->validate(['alt' => ['required', 'string', 'max:500']]);
        $media->setCustomProperty('alt', $data['alt'])->save();

        return response()->json(['success' => true]);
    }

    public function cover(Project $project, Media $media): JsonResponse
    {
        abort_unless($media->model_type === $project->getMorphClass() && $media->model_id === $project->id && $media->collection_name === 'images', 404);
        $ids = $project->getMedia('images')->pluck('id')->reject(fn ($id) => $id === $media->id)->prepend($media->id)->values()->all();
        DB::transaction(fn () => Media::setNewOrder($ids));

        return response()->json(['success' => true]);
    }

    public function destroy(Project $project, Media $media): JsonResponse
    {
        abort_unless($media->model_type === $project->getMorphClass() && $media->model_id === $project->id && $media->collection_name === 'images', 404);
        $media->delete();

        return response()->json(['success' => true]);
    }
}
