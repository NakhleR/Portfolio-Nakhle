<?php

namespace App\Services;

use App\Models\CmsDocument;
use App\Models\SiteAsset;
use Illuminate\Http\Request;

class CmsContent
{
    public function defaults(string $section): array
    {
        $fields = config('cms.'.$section.'.fields');
        abort_unless(is_array($fields), 404);
        $defaults = array_map(fn ($field) => $field['default'], $fields);
        if ($section === 'legal') {
            foreach ($defaults as $key => $value) {
                $defaults[$key] = config('privacy.'.$key) ?? $value;
            }
        }

        return $defaults;
    }

    public function all(Request $request): array
    {
        if ($request->attributes->has('cms.resolved')) {
            return $request->attributes->get('cms.resolved');
        }
        $preview = $request->user()?->is_admin && $request->boolean('preview');
        $documents = CmsDocument::query()->select($preview ? ['key', 'published', 'draft'] : ['key', 'published'])->get()->keyBy('key');
        $result = [];
        foreach (array_keys(config('cms')) as $key) {
            if (in_array($key, ['privacy', 'cookies', 'terms'], true) && $request->path() !== $key) {
                continue;
            }
            $record = $documents->get($key);
            $data = $preview ? ($record?->draft ?? $record?->published) : $record?->published;
            $result[$key] = array_replace($this->defaults($key), $data ?? []);
        }
        $assets = SiteAsset::with('media')->get()->keyBy('slot');
        $portrait = $assets->get('portrait')?->getFirstMedia('portrait');
        $result['assets'] = ['portrait' => $portrait?->getAvailableUrl(['display']) ?? '/nakhle-960.webp', 'portrait_original' => $portrait?->getUrl() ?? '/nakhle.png', 'portrait_srcset' => $portrait ? '' : '/nakhle-480.webp 480w, /nakhle-960.webp 960w', 'cv' => $assets->get('cv')?->getFirstMediaUrl('cv') ?: '/Nakhle_CV.pdf'];
        $request->attributes->set('cms.resolved', $result);

        return $result;
    }
}
