<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProjectResource;
use App\Http\Resources\TimelineResource;
use App\Models\ContactMessage;
use App\Models\Project;
use App\Models\Timeline;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Dashboard', [
            'projects' => ProjectResource::collection(Project::with('media')->orderBy('order')->orderBy('id')->get())->resolve(),
            'timeline' => TimelineResource::collection(Timeline::orderBy('order')->orderBy('id')->get())->resolve(),
            'messages' => ContactMessage::latest()->paginate(20),
        ]);
    }
}
