<?php

namespace App\Http\Controllers;

use App\Http\Requests\UploadRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Models\SiteAsset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class SiteAssetController extends Controller
{
    public function index(Request $request): Response
    {
        $request->validate(['project' => ['nullable', 'string', 'max:100']]);
        $selected = $request->filled('project') ? Project::with('media')->where('mongo_id', $request->query('project'))->firstOrFail() : null;

        return Inertia::render('MediaLibrary', ['projects' => Project::orderBy('title')->get(['mongo_id', 'title']), 'selectedProject' => $selected ? (new ProjectResource($selected))->resolve() : null, 'media' => Media::where('model_type', (new Project)->getMorphClass())->where('collection_name', 'images')->latest()->paginate(24)->through(fn ($media) => ['id' => $media->id, 'url' => $media->getAvailableUrl(['display']), 'name' => $media->file_name, 'size' => $media->size, 'project' => $media->model?->mongo_id])->withQueryString()]);
    }

    public function store(Request $request, string $slot): JsonResponse
    {
        abort_unless(in_array($slot, ['portrait', 'cv'], true), 404);
        $rules = $slot === 'cv' ? ['required', 'file', 'max:10240', 'mimes:pdf', 'extensions:pdf'] : (new UploadRequest)->rules()['file'];
        $request->validate(['file' => $rules]);
        $file = $request->file('file');
        if ($slot === 'portrait') {
            abort_unless(in_array($file->getMimeType(), ['image/jpeg', 'image/png', 'image/webp', 'image/avif']), 422);
        }
        $asset = SiteAsset::firstOrCreate(['slot' => $slot]);
        $extension = $slot === 'cv' ? 'pdf' : match ($file->getMimeType()) {
            'image/jpeg' => 'jpg','image/png' => 'png','image/webp' => 'webp','image/avif' => 'avif'
        };
        $media = $asset->addMedia($file)->usingFileName(Str::uuid().'.'.$extension)->toMediaCollection($slot);

        return response()->json(['id' => $media->id, 'url' => $media->getUrl()], 201);
    }
}
