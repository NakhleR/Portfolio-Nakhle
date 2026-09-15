<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        Vite::useCspNonce();

        return $this->apply($request, $next($request));
    }

    public function apply(Request $request, Response $response): Response
    {
        $script = "'self' 'nonce-".Vite::cspNonce()."' 'wasm-unsafe-eval'";
        $connect = "'self' blob:";
        $style = "'self' 'unsafe-inline'";
        if (app()->environment('local') && Vite::isRunningHot()) {
            $origin = rtrim(trim(file_get_contents(Vite::hotFile())), '/');
            if (preg_match('#^https?://[a-zA-Z0-9.\-\[\]:]+$#', $origin)) {
                $script .= ' '.$origin;
                $style .= ' '.$origin;
                $connect .= ' '.$origin.' '.preg_replace('#^http#', 'ws', $origin);
            }
        }

        // Inline styles power GSAP/Three.js; only WebAssembly compilation is
        // permitted for Draco, without enabling JavaScript eval or inline scripts.
        $response->headers->set('Content-Security-Policy', implode('; ', [
            "default-src 'self'", "base-uri 'none'", "object-src 'none'",
            "frame-ancestors 'none'", "frame-src 'none'", "form-action 'self'",
            'script-src '.$script, 'style-src '.$style,
            "img-src 'self' data: blob: https://*.tile.openstreetmap.org",
            "font-src 'self' data:", 'connect-src '.$connect,
            "worker-src 'self' blob:", "manifest-src 'self'",
        ]));
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()');
        $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');
        // Dynamic pages include CSRF tokens, consent choices or private data.
        // Static images, models, fonts and compiled assets keep their own caching.
        $response->headers->set('Cache-Control', 'private, no-store');
        if (app()->environment('production') && $request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000');
        }

        return $response;
    }
}
