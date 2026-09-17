<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\AcceptHeader;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->is('fr', 'fr/*') ? 'fr' : 'en';
        app()->setLocale($locale);

        if ($request->isMethod('GET') && $request->routeIs('home', 'about', 'work', 'work.show', 'contact', 'privacy', 'cookies', 'terms', 'legal', 'fr.*')) {
            if ($request->query('lang') === $locale) {
                $request->session()->put('preferred_locale', $locale);

                return redirect($request->fullUrlWithoutQuery(['lang']));
            }

            if ($request->routeIs('home') && ! $request->header('X-Inertia')) {
                $preferredLocale = $request->session()->get('preferred_locale');
                if (! in_array($preferredLocale, ['en', 'fr'], true)) {
                    $preferredLocale = $this->browserLocale($request);
                }

                if ($preferredLocale === 'fr') {
                    return to_route('fr.home', $request->except('lang'));
                }
            }
        }

        return $next($request);
    }

    private function browserLocale(Request $request): string
    {
        foreach (AcceptHeader::fromString($request->header('Accept-Language', ''))->all() as $language) {
            $locale = strtolower(explode('-', str_replace('_', '-', $language->getValue()))[0]);
            if ($language->getQuality() > 0 && in_array($locale, ['en', 'fr'], true)) {
                return $locale;
            }
        }

        return 'en';
    }
}
