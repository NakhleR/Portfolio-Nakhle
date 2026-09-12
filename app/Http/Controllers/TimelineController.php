<?php

namespace App\Http\Controllers;

use App\Http\Requests\TimelineRequest;
use App\Models\Timeline;
use Illuminate\Http\RedirectResponse;

class TimelineController extends Controller
{
    public function store(TimelineRequest $request): RedirectResponse
    {
        Timeline::create($request->validated());

        return to_route('dashboard')->with('success', 'Timeline entry created.');
    }

    public function update(TimelineRequest $request, Timeline $timeline): RedirectResponse
    {
        $timeline->update($request->validated());

        return to_route('dashboard')->with('success', 'Timeline entry updated.');
    }

    public function destroy(Timeline $timeline): RedirectResponse
    {
        $timeline->delete();

        return to_route('dashboard')->with('success', 'Timeline entry deleted.');
    }
}
