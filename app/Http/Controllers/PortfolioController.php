<?php

namespace App\Http\Controllers;

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
        return Inertia::render('Home', ['projects' => ProjectResource::collection(Project::with('media')->orderBy('order')->orderBy('id')->limit(2)->get())->resolve()]);
    }

    public function about(): Response
    {
        return Inertia::render('About', ['timeline' => TimelineResource::collection(Timeline::orderBy('order')->orderBy('id')->get())->resolve()]);
    }

    public function work(Request $request): Response|RedirectResponse
    {
        if ($request->filled('project')) {
            return to_route('work.show', ['project' => $request->string('project')->toString()]);
        }

        return Inertia::render('Work', ['projects' => ProjectResource::collection(Project::with('media')->orderBy('order')->orderBy('id')->get())->resolve()]);
    }

    public function project(Project $project): Response
    {
        return Inertia::render('Project', ['project' => (new ProjectResource($project->load('media')))->resolve()]);
    }

    public function contact(): Response
    {
        return Inertia::render('Contact');
    }
}
