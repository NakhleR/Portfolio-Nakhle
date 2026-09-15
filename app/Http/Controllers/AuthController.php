<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function create(): Response
    {
        Inertia::clearHistory();

        return Inertia::render('Login');
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $key = 'login-account:'.hash('sha256', mb_strtolower(trim($request->string('email')->toString())));
        if (RateLimiter::tooManyAttempts($key, 10)) {
            throw ValidationException::withMessages(['email' => 'Too many login attempts. Please try again in 15 minutes.'])->status(429);
        }
        if (! Auth::attempt([...$request->validated(), 'is_admin' => true])) {
            RateLimiter::hit($key, 15 * 60);
            throw ValidationException::withMessages(['email' => 'The provided credentials do not match our records.']);
        }
        RateLimiter::clear($key);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        Inertia::clearHistory();

        return to_route('home');
    }
}
