<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProjectCardResource;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\TimelineResource;
use App\Models\Project;
use App\Models\Timeline;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('Home');
    }

    public function about(): Response
    {
        return Inertia::render('About', ['timeline' => TimelineResource::collection(Timeline::orderBy('order')->orderBy('id')->get())->resolve()]);
    }

    public function work(Request $request): Response|RedirectResponse
    {
        if ($request->filled('project')) {
            return to_route((app()->getLocale() === 'fr' ? 'fr.' : '').'work.show', ['project' => $request->string('project')->toString()]);
        }

        return Inertia::render('Work', ['projects' => ProjectCardResource::collection(Project::where('is_published', true)->with('media')->orderBy('order')->orderBy('id')->get())->resolve()]);
    }

    public function project(Project $project): Response
    {
        abort_unless($project->is_published || request()->user()?->is_admin && request()->boolean('preview'), 404);

        return Inertia::render('Project', ['project' => (new ProjectResource($project->load('media')))->resolve()]);
    }

    public function contact(): Response
    {
        return Inertia::render('Contact', ['mapsKey' => config('services.google_maps.key')]);
    }
}
