<?php

namespace App\Services;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PageSeo
{
    public function forRequest(Request $request): array
    {
        $base = rtrim(config('app.url'), '/');
        $path = rtrim($request->getPathInfo(), '/');
        $canonical = $base.$path;
        $route = $request->route()?->getName();
        $pages = [
            'home' => ['Nakhle Rizk — Full Stack Developer & AI Student', 'Explore Nakhle Rizk’s portfolio of web applications, mobile apps, games, and AI projects. Available for employment and client collaborations.'],
            'about' => ['About Nakhle Rizk — Developer & AI Student', 'Meet Nakhle Rizk, a full stack developer and AI and machine learning student. Explore his skills, experience, and approach to building software.'],
            'work' => ['Software, Web & AI Projects — Nakhle Rizk', 'Explore Nakhle Rizk’s web development, mobile, game, and AI projects, with case studies, technology stacks, screenshots, and source code links.'],
            'contact' => ['Contact Nakhle Rizk — Projects & Opportunities', 'Contact Nakhle Rizk about a software project, a development role, or a collaboration. Get in touch to discuss your idea or opportunity.'],
            'login' => ['Admin Login — Nakhle Rizk', 'Sign in to manage the portfolio.'],
            'dashboard' => ['Dashboard — Nakhle Rizk', 'Portfolio administration.'],
            'analytics' => ['Analytics — Nakhle Rizk', 'Private portfolio analytics.'],
            'privacy' => ['Privacy Policy — Nakhle Rizk', 'How this portfolio handles personal information and analytics choices.'],
            'cookies' => ['Cookie Policy — Nakhle Rizk', 'Cookies, browser storage, and how to manage your choices.'],
            'terms' => ['Terms of Use — Nakhle Rizk', 'Terms for using this portfolio and its content.'],
            'legal' => ['Legal Notice & Copyright — Nakhle Rizk', 'Publisher information, content ownership, and hosting details.'],
        ];
        [$title, $description] = $pages[$route] ?? ['Page not found — Nakhle Rizk', 'The requested page could not be found. Explore Nakhle Rizk’s portfolio.'];
        $cms = app(CmsContent::class)->all($request);
        if (isset($cms['seo'][$route.'_title'])) {
            $title = $cms['seo'][$route.'_title'];
            $description = $cms['seo'][$route.'_description'];
        }
        if ($request->is('dashboard/*')) {
            $title = 'CMS — '.$cms['site']['name'];
            $description = 'Private website administration.';
        }
        $image = str_starts_with($cms['assets']['portrait'], '/') ? $base.$cms['assets']['portrait'] : $cms['assets']['portrait'];
        $imageAlt = 'Nakhle Rizk, full stack developer and AI student';
        $project = $request->route('project');
        if ($route === 'work.show' && $project instanceof Project) {
            $title = $project->title.' — Project by Nakhle Rizk';
            $description = Str::limit(Str::squish(strip_tags($project->description)), 160);
            $media = $project->getFirstMedia('images');
            $image = $media?->getAvailableUrl(['display']) ?? $image;
            $imageAlt = $project->title.' project preview';
        }
        $indexable = in_array($route, ['home', 'about', 'work', 'work.show', 'contact', 'privacy', 'cookies', 'terms', 'legal'], true);
        if ($request->user()?->is_admin && $request->boolean('preview')) {
            $indexable = false;
        }
        $schema = $indexable ? [
            '@context' => 'https://schema.org',
            '@graph' => [
                ['@type' => 'WebSite', '@id' => $base.'/#website', 'url' => $base.'/', 'name' => $cms['site']['name'], 'inLanguage' => 'en'],
                ['@type' => 'Person', '@id' => $base.'/#person', 'name' => $cms['site']['name'], 'url' => $base.'/', 'image' => $image, 'jobTitle' => 'Full Stack Developer', 'sameAs' => [$cms['site']['github'], $cms['site']['linkedin']]],
                ['@type' => $route === 'about' ? 'ProfilePage' : ($route === 'contact' ? 'ContactPage' : ($route === 'work' ? 'CollectionPage' : 'WebPage')), '@id' => $canonical.'#webpage', 'url' => $canonical, 'name' => $title, 'description' => $description, 'isPartOf' => ['@id' => $base.'/#website'], 'about' => ['@id' => $base.'/#person']],
            ],
        ] : null;
        if ($route === 'about') {
            $schema['@graph'][2]['mainEntity'] = ['@id' => $base.'/#person'];
        }
        if ($indexable && $route === 'work.show' && $project instanceof Project) {
            $schema['@graph'][2]['mainEntity'] = ['@id' => $canonical.'#project'];
            $schema['@graph'][] = ['@type' => 'CreativeWork', '@id' => $canonical.'#project', 'name' => $project->title, 'description' => $description, 'url' => $canonical, 'image' => $image, 'creator' => ['@id' => $base.'/#person'], 'dateModified' => $project->updated_at?->toIso8601String()];
        }

        return [
            'title' => $title, 'description' => $description, 'canonical' => $canonical,
            'image' => $image, 'imageAlt' => $imageAlt,
            'robots' => $indexable ? 'index, follow, max-image-preview:large' : 'noindex, nofollow',
            'schema' => $schema ? json_encode($schema, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR) : null,
        ];
    }
}
