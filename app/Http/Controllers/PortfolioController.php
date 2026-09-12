<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProjectResource;
use App\Http\Resources\TimelineResource;
use App\Models\Project;
use App\Models\Timeline;
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

    public function work(): Response
    {
        return Inertia::render('Work', ['projects' => ProjectResource::collection(Project::with('media')->orderBy('order')->orderBy('id')->get())->resolve()]);
    }

    public function contact(): Response
    {
        return Inertia::render('Contact');
    }
}
