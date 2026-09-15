<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProjectResource;
use App\Http\Resources\TimelineResource;
use App\Models\AnalyticsEvent;
use App\Models\CmsDocument;
use App\Models\ContactMessage;
use App\Models\Project;
use App\Models\Timeline;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $views = AnalyticsEvent::where('type', 'page_view')->where('created_at', '>=', now()->subDays(29)->startOfDay());
        $daily = (clone $views)->selectRaw('DATE(created_at) as day, COUNT(DISTINCT view_id) as views, COUNT(DISTINCT session_id) as sessions')->groupByRaw('DATE(created_at)')->get()->keyBy('day');

        return Inertia::render('Dashboard', [
            'stats' => ['views' => (clone $views)->distinct()->count('view_id'), 'sessions' => (clone $views)->distinct()->count('session_id'), 'newMessages' => ContactMessage::where('status', 'new')->count(), 'drafts' => CmsDocument::whereNotNull('draft')->count() + Project::where('is_published', false)->count(), 'published' => Project::where('is_published', true)->count(), 'media' => Media::count()],
            'daily' => collect(range(29, 0))->map(function ($offset) use ($daily) {
                $day = now()->subDays($offset)->toDateString();

                return $daily->get($day) ?? ['day' => $day, 'views' => 0, 'sessions' => 0];
            }),
            'recent' => CmsDocument::latest('updated_at')->limit(4)->get(['key', 'updated_at']),
            'projects' => ProjectResource::collection(Project::with('media')->orderBy('order')->orderBy('id')->get())->resolve(),
            'timeline' => TimelineResource::collection(Timeline::orderBy('order')->orderBy('id')->get())->resolve(),
        ]);
    }
}
