<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InboxController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate(['status' => ['nullable', 'in:new,read,replied,archived'], 'q' => ['nullable', 'string', 'max:100']]);
        $query = ContactMessage::query();
        if ($request->filled('status')) {
            $query->where('status', $filters['status']);
        }
        if ($request->filled('q')) {
            $query->where(fn ($q) => $q->where('name', 'like', '%'.$filters['q'].'%')->orWhere('email', 'like', '%'.$filters['q'].'%')->orWhere('message', 'like', '%'.$filters['q'].'%'));
        }

        return Inertia::render('Inbox', ['messages' => $query->latest()->paginate(15)->withQueryString(), 'filters' => $filters, 'counts' => ContactMessage::selectRaw('status, COUNT(*) as total')->groupBy('status')->pluck('total', 'status')]);
    }

    public function update(Request $request, ContactMessage $message): RedirectResponse
    {
        $data = $request->validate(['status' => ['required', 'in:new,read,replied,archived'], 'notes' => ['nullable', 'string', 'max:10000']]);
        $message->forceFill($data)->save();

        return back()->with('success', 'Enquiry updated.');
    }

    public function destroy(ContactMessage $message): RedirectResponse
    {
        $message->delete();

        return back()->with('success', 'Enquiry permanently deleted.');
    }
}
