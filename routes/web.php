<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\ProjectController;
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
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:5,1')->name('contact.store');
Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthController::class, 'create'])->name('login');
    Route::post('/login', [AuthController::class, 'store'])->middleware('throttle:5,1')->name('login.store');
});
Route::post('/logout', [AuthController::class, 'destroy'])->middleware('auth')->name('logout');
Route::middleware(['auth', 'admin'])->group(function (): void {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::resource('/dashboard/projects', ProjectController::class)->only(['store', 'update', 'destroy']);
    Route::resource('/dashboard/timeline', TimelineController::class)->only(['store', 'update', 'destroy'])->parameters(['timeline' => 'timeline']);
    Route::post('/dashboard/projects/{project}/media', [MediaController::class, 'store'])->name('media.store');
    Route::delete('/dashboard/projects/{project}/media/{media}', [MediaController::class, 'destroy'])->name('media.destroy');
});
Route::get('/api/projects', fn () => response()->json(ProjectResource::collection(Project::with('media')->orderBy('order')->orderBy('id')->get())->resolve()));
Route::get('/api/projects/{project}', fn (Project $project) => response()->json((new ProjectResource($project->load('media')))->resolve()));
Route::get('/api/timeline', fn () => response()->json(TimelineResource::collection(Timeline::orderBy('order')->orderBy('id')->get())->resolve()));
Route::get('/api/timeline/{timeline}', fn (Timeline $timeline) => response()->json((new TimelineResource($timeline))->resolve()));
Route::get('/health', fn () => response()->json(['status' => 'ok', 'database' => DB::select('SELECT 1') ? 'ok' : 'unavailable']));
Route::get('/sitemap.xml', fn () => response()->view('sitemap')->header('Content-Type', 'application/xml'));
Route::fallback(fn () => Inertia::render('NotFound')->toResponse(request())->setStatusCode(404));
