<?php

namespace App\Http\Middleware;

use App\Services\PageSeo;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    protected $withoutSsr = ['dashboard', 'dashboard/*'];

    public function share(Request $request): array
    {
        return [...parent::share($request),
            'seo' => fn () => app(PageSeo::class)->forRequest($request),
            'auth' => ['user' => $request->user()?->only(['name', 'email', 'is_admin'])],
            'flash' => ['success' => fn () => $request->session()->get('success')],
        ];
    }
}
