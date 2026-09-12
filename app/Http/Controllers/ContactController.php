<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContactRequest;
use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;

class ContactController extends Controller
{
    public function store(ContactRequest $request): RedirectResponse
    {
        ContactMessage::create($request->safe()->only(['name', 'email', 'message']));

        return to_route('contact')->with('success', 'Thank you! Your message has been received.');
    }
}
