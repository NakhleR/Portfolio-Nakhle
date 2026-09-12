<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProjectRequest;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;

class ProjectController extends Controller
{
    public function store(ProjectRequest $request): RedirectResponse
    {
        $project = Project::create($request->validated());

        return to_route('dashboard', ['edit' => $project->mongo_id])->with('success', 'Project created. You can now add images.');
    }

    public function update(ProjectRequest $request, Project $project): RedirectResponse
    {
        $project->update($request->validated());

        return to_route('dashboard')->with('success', 'Project updated.');
    }

    public function destroy(Project $project): RedirectResponse
    {
        $project->delete();

        return to_route('dashboard')->with('success', 'Project deleted.');
    }
}
