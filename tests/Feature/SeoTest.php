<?php

namespace Tests\Feature;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SeoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        config(['app.url' => 'https://portfolio.example', 'inertia.ssr.enabled' => false]);
        Storage::fake('public');
    }

    private function project(string $title = 'Accessible web application'): Project
    {
        return Project::create(['title' => $title, 'category' => 'Web Development', 'description' => 'A Vue and Laravel application with accessible navigation.', 'technologies' => ['Vue', 'Laravel'], 'order' => 0]);
    }

    public function test_public_pages_have_distinct_metadata_even_without_ssr(): void
    {
        $descriptions = [];
        foreach (['/' => 'home', '/work' => 'work', '/about' => 'about', '/contact' => 'contact'] as $path => $name) {
            $response = $this->get($path.'?tracking=ignored')->assertOk();
            $canonical = 'https://portfolio.example'.rtrim($path, '/');
            $response->assertSee('rel="canonical" href="'.$canonical.'"', false)
                ->assertSee('property="og:title"', false)
                ->assertSee('name="twitter:card" content="summary_large_image"', false)
                ->assertInertia(fn (Assert $page) => $page
                    ->where('seo.canonical', $canonical)
                    ->where('seo.robots', 'index, follow, max-image-preview:large'));
            preg_match('/<meta data-inertia="description" name="description" content="([^"]+)"/', $response->getContent(), $match);
            $descriptions[] = $match[1];
        }
        $this->assertCount(4, array_unique($descriptions));
    }

    public function test_inertia_navigation_receives_the_destination_canonical(): void
    {
        $version = app(HandleInertiaRequests::class)->version(Request::create('/work'));
        $this->withHeaders(['X-Inertia' => 'true', 'X-Inertia-Version' => $version ?? '', 'Referer' => 'https://portfolio.example/'])
            ->get('/work?tracking=ignored')->assertOk()
            ->assertJsonPath('props.seo.canonical', 'https://portfolio.example/work')
            ->assertJsonPath('props.seo.title', 'Software, Web & AI Projects — Nakhle Rizk');
    }

    public function test_project_metadata_and_schema_escape_user_content(): void
    {
        $project = $this->project('Demo </script><script>alert(1)</script>');
        $response = $this->get('/work/'.$project->mongo_id)->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('seo.title', $project->title.' — Project by Nakhle Rizk')
            ->where('seo.description', $project->description));
        $response->assertDontSee('</script><script>alert(1)</script>', false);
        preg_match('/<script data-inertia="structured-data" type="application\/ld\+json">(.*?)<\/script>/s', $response->getContent(), $match);
        $schema = json_decode($match[1], true, flags: JSON_THROW_ON_ERROR);
        $this->assertSame('CreativeWork', $schema['@graph'][3]['@type']);
        $this->assertSame($project->title, $schema['@graph'][3]['name']);
    }

    public function test_sitemap_and_robots_use_the_configured_domain_and_include_projects(): void
    {
        $first = $this->project();
        $second = $this->project('Another project');
        $this->get('/sitemap.xml')->assertOk()
            ->assertSee('https://portfolio.example/work/'.$first->mongo_id, false)
            ->assertSee('https://portfolio.example/work/'.$second->mongo_id, false)
            ->assertSee('<lastmod>', false)
            ->assertDontSee('/login', false);
        $this->get('/robots.txt')->assertOk()
            ->assertSee('Sitemap: https://portfolio.example/sitemap.xml', false)
            ->assertDontSee('vercel.app', false);
        $this->assertFileDoesNotExist(public_path('robots.txt'));
    }

    public function test_login_and_missing_pages_are_not_indexable(): void
    {
        $this->get('/login')->assertOk()->assertSee('name="robots" content="noindex, nofollow"', false);
        $this->get('/missing')->assertNotFound()->assertSee('name="robots" content="noindex, nofollow"', false);
    }
}
