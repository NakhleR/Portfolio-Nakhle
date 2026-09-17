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
            if (str_starts_with($key, 'fr_')) {
                continue;
            }
            if (in_array($key, ['privacy', 'cookies', 'terms'], true) && $request->segment(app()->getLocale() === 'fr' ? 2 : 1) !== $key) {
                continue;
            }
            $record = $documents->get($key);
            $data = $preview ? ($record?->draft ?? $record?->published) : $record?->published;
            $result[$key] = array_replace($this->defaults($key), $data ?? []);
            if (app()->getLocale() === 'fr' && config('cms.fr_'.$key)) {
                $localized = $documents->get('fr_'.$key);
                $translated = $preview ? ($localized?->draft ?? $localized?->published) : $localized?->published;
                $result[$key] = array_replace($result[$key], $this->defaults('fr_'.$key), $translated ?? []);
            }
            if (in_array($key, ['privacy', 'cookies'], true)) {
                array_walk_recursive($result[$key], function (&$value): void {
                    if (is_string($value)) {
                        $value = str_replace(['Google Maps', '{{map_provider}}'], 'OpenStreetMap', $value);
                        $value = strtr($value, [
                            'The interactive map connects to OpenStreetMap only when you choose to load it.' => 'The interactive map loads automatically on the contact page and connects to OpenStreetMap.',
                            'The map stays inactive until you request it. Loading it contacts OpenStreetMap.' => 'The map loads automatically on the contact page and connects to OpenStreetMap, which receives connection information such as your IP address.',
                            'La carte ne contacte OpenStreetMap que lorsque vous demandez son chargement' => 'La carte se charge automatiquement sur la page de contact et contacte OpenStreetMap',
                            'La carte reste inactive jusqu’à votre demande. Son chargement contacte OpenStreetMap.' => 'La carte se charge automatiquement sur la page de contact et contacte OpenStreetMap, qui reçoit notamment votre adresse IP.',
                        ]);
                        $value = str_replace('OpenStreetMap', app()->getLocale() === 'fr' ? 'Google Maps ou OpenStreetMap (carte de secours)' : 'Google Maps or OpenStreetMap (fallback map)', $value);
                    }
                });
            }
        }
        $assets = SiteAsset::with('media')->get()->keyBy('slot');
        $portrait = $assets->get('portrait')?->getFirstMedia('portrait');
        $result['assets'] = ['portrait' => $portrait?->getAvailableUrl(['display']) ?? '/nakhle-960.webp', 'portrait_original' => $portrait?->getUrl() ?? '/nakhle.png', 'portrait_srcset' => $portrait ? '' : '/nakhle-480.webp 480w, /nakhle-960.webp 960w', 'cv' => $assets->get('cv')?->getFirstMediaUrl('cv') ?: '/Nakhle_CV.pdf'];
        $request->attributes->set('cms.resolved', $result);

        return $result;
    }
}
