<?php

namespace App\Http\Middleware;

use App\Models\AnalyticsConsent;
use App\Services\CmsContent;
use App\Services\PageSeo;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Middleware;
use Symfony\Component\HttpFoundation\Response;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    protected $withoutSsr = ['dashboard', 'dashboard/*'];

    public function handle(Request $request, Closure $next): Response
    {
        Inertia::encryptHistory($request->user() !== null);

        return parent::handle($request, $next);
    }

    public function share(Request $request): array
    {
        return [...parent::share($request),
            'cms' => fn () => app(CmsContent::class)->all($request),
            'cmsPreview' => (bool) ($request->user()?->is_admin && $request->boolean('preview')),
            'seo' => fn () => app(PageSeo::class)->forRequest($request),
            'privacy' => fn () => ['analytics' => AnalyticsConsent::current($request)?->analytics, 'version' => AnalyticsConsent::VERSION],
            'auth' => ['user' => $request->user()?->only(['name', 'email', 'is_admin'])],
            'flash' => ['success' => fn () => $request->session()->get('success')],
        ];
    }
}
