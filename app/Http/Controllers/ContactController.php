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

        return to_route((app()->getLocale() === 'fr' ? 'fr.' : '').'contact')->with('success', app()->getLocale() === 'fr' ? 'Merci ! Votre message a bien été reçu.' : 'Thank you! Your message has been received.');
    }
}
