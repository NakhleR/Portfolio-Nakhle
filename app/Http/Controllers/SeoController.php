<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Response;

class SeoController extends Controller
{
    public function sitemap(): Response
    {
        return response()->view('sitemap', [
            'base' => rtrim(config('app.url'), '/'),
            'projects' => Project::select(['mongo_id', 'updated_at'])->orderBy('id')->get(),
        ])->header('Content-Type', 'application/xml; charset=UTF-8');
    }

    public function robots(): Response
    {
        $sitemap = rtrim(config('app.url'), '/').'/sitemap.xml';

        return response("User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /api/\n\nSitemap: {$sitemap}\n")
            ->header('Content-Type', 'text/plain; charset=UTF-8');
    }
}
