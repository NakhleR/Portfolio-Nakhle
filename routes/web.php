<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CmsController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InboxController;
use App\Http\Controllers\MapAccessController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\PrivacyController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SeoController;
use App\Http\Controllers\SiteAssetController;
use App\Http\Controllers\TimelineController;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\TimelineResource;
use App\Models\Project;
use App\Models\Timeline;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [PortfolioController::class, 'home'])->name('home');
Route::get('/about', [PortfolioController::class, 'about'])->name('about');
Route::get('/work', [PortfolioController::class, 'work'])->name('work');
Route::get('/work/{project}', [PortfolioController::class, 'project'])->name('work.show');
Route::get('/contact', [PortfolioController::class, 'contact'])->name('contact');
Route::post('/maps/access', MapAccessController::class)->middleware('throttle:30,1')->name('maps.access');
Route::prefix('fr')->name('fr.')->group(function (): void {
    Route::get('/', [PortfolioController::class, 'home'])->name('home');
    Route::get('/about', [PortfolioController::class, 'about'])->name('about');
    Route::get('/work', [PortfolioController::class, 'work'])->name('work');
    Route::get('/work/{project}', [PortfolioController::class, 'project'])->name('work.show');
    Route::get('/contact', [PortfolioController::class, 'contact'])->name('contact');
    Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:5,1')->name('contact.store');
    foreach (['privacy', 'cookies', 'terms', 'legal'] as $document) {
        Route::get('/'.$document, [PrivacyController::class, 'page'])->name($document);
    }
});
foreach (['privacy', 'cookies', 'terms', 'legal'] as $document) {
    Route::get('/'.$document, [PrivacyController::class, 'page'])->name($document);
}
Route::post('/privacy/consent', [PrivacyController::class, 'consent'])->middleware('throttle:20,1');
Route::post('/privacy/erase-analytics', [PrivacyController::class, 'erase'])->middleware('throttle:5,1');
Route::post('/analytics/events', [AnalyticsController::class, 'store'])->middleware('throttle:30,1');
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:5,1')->name('contact.store');
Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthController::class, 'create'])->name('login');
    Route::post('/login', [AuthController::class, 'store'])->middleware('throttle:5,1')->name('login.store');
});
Route::post('/logout', [AuthController::class, 'destroy'])->middleware('auth')->name('logout');
Route::middleware(['auth', 'admin'])->group(function (): void {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::get('/dashboard/pages/{section}', [CmsController::class, 'edit'])->name('cms.edit');
    Route::put('/dashboard/pages/{section}', [CmsController::class, 'save'])->name('cms.save');
    Route::post('/dashboard/pages/{section}/publish', [CmsController::class, 'publish'])->name('cms.publish');
    Route::post('/dashboard/pages/{section}/restore/{revision}', [CmsController::class, 'restore'])->name('cms.restore');
    Route::get('/dashboard/inbox', [InboxController::class, 'index'])->name('inbox');
    Route::patch('/dashboard/inbox/{message}', [InboxController::class, 'update']);
    Route::delete('/dashboard/inbox/{message}', [InboxController::class, 'destroy']);
    Route::get('/dashboard/media', [SiteAssetController::class, 'index'])->name('library');
    Route::post('/dashboard/assets/{slot}', [SiteAssetController::class, 'store'])->middleware('throttle:20,1');
    Route::get('/dashboard/account', [AccountController::class, 'edit'])->name('account');
    Route::put('/dashboard/account', [AccountController::class, 'update'])->middleware('throttle:5,1');
    Route::patch('/dashboard/projects/{project}/media/{media}', [MediaController::class, 'update']);
    Route::post('/dashboard/projects/{project}/media/{media}/cover', [MediaController::class, 'cover']);
    Route::get('/dashboard/analytics', [AnalyticsController::class, 'index'])->name('analytics');
    Route::resource('/dashboard/projects', ProjectController::class)->only(['store', 'update', 'destroy']);
    Route::resource('/dashboard/timeline', TimelineController::class)->only(['store', 'update', 'destroy'])->parameters(['timeline' => 'timeline']);
    Route::post('/dashboard/projects/{project}/media', [MediaController::class, 'store'])->middleware('throttle:30,1')->name('media.store');
    Route::delete('/dashboard/projects/{project}/media/{media}', [MediaController::class, 'destroy'])->name('media.destroy');
});
Route::get('/api/projects', fn () => response()->json(ProjectResource::collection(Project::where('is_published', true)->with('media')->orderBy('order')->orderBy('id')->get())->resolve()));
Route::get('/api/projects/{project}', function (Project $project) {
    abort_unless($project->is_published, 404);

    return response()->json((new ProjectResource($project->load('media')))->resolve());
});
Route::get('/api/timeline', fn () => response()->json(TimelineResource::collection(Timeline::orderBy('order')->orderBy('id')->get())->resolve()));
Route::get('/api/timeline/{timeline}', fn (Timeline $timeline) => response()->json((new TimelineResource($timeline))->resolve()));
Route::get('/health', fn () => response()->json(['status' => 'ok', 'database' => DB::select('SELECT 1') ? 'ok' : 'unavailable']));
Route::get('/sitemap.xml', [SeoController::class, 'sitemap'])->name('sitemap');
Route::get('/robots.txt', [SeoController::class, 'robots'])->name('robots');
Route::fallback(fn () => Inertia::render('NotFound')->toResponse(request())->setStatusCode(404));
