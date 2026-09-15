<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('Account');
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate(['current_password' => ['required', 'current_password'], 'password' => ['required', 'confirmed', 'max:72', function (string $attribute, mixed $value, \Closure $fail): void {
            if (strlen($value) > 72) {
                $fail('Please use a shorter password.');
            }
        }, Password::min(12)->letters()->mixedCase()->numbers()->symbols()]]);
        $request->user()->update(['password' => $data['password']]);
        if (config('session.driver') === 'database') {
            DB::connection(config('session.connection'))->table(config('session.table'))->where('user_id', $request->user()->id)->delete();
        }
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        Inertia::clearHistory();

        return to_route('login')->with('success', 'Password changed. Sign in with your new password.');
    }
}
