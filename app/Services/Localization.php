<?php

namespace App\Services;

use App\Models\CmsDocument;
use Illuminate\Support\Arr;

class Localization
{
    /** @return array<string, string> */
    public function project(string $id, ?string $locale = null): array
    {
        if (($locale ?? app()->getLocale()) !== 'fr') {
            return [];
        }
        $request = request();
        if (! $request->attributes->has('translations.projects')) {
            $document = CmsDocument::find('fr_projects');
            $preview = $request->user()?->is_admin && $request->boolean('preview');
            $data = $preview ? ($document?->draft ?? $document?->published) : $document?->published;
            $request->attributes->set('translations.projects', $data['projects'] ?? config('cms.fr_projects.fields.projects.default'));
        }
        foreach ($request->attributes->get('translations.projects') as $project) {
            if ($project['id'] === $id) {
                return Arr::only($project, ['title', 'description', 'longDescription']);
            }
        }

        return [];
    }
}
