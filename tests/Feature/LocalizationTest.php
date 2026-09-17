<?php

namespace Tests\Feature;

use App\Models\CmsDocument;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LocalizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        Storage::fake('public');
        config(['app.url' => 'https://portfolio.example', 'app.canonical_url' => 'https://portfolio.example', 'inertia.ssr.enabled' => false]);
    }

    public function test_french_pages_have_translated_content_and_reciprocal_alternates(): void
    {
        foreach (['' => 'home', '/about' => 'about', '/work' => 'work', '/contact' => 'contact', '/privacy' => 'privacy', '/cookies' => 'cookies', '/terms' => 'terms', '/legal' => 'legal'] as $path => $name) {
            $this->get('/fr'.$path.'?source=ignored')->assertOk()
                ->assertSee('<html lang="fr">', false)
                ->assertSee('hreflang="en" href="https://portfolio.example'.$path.'"', false)
                ->assertInertia(fn (Assert $page) => $page
                    ->where('locale', 'fr')
                    ->where('seo.canonical', 'https://portfolio.example/fr'.$path)
                    ->where('seo.alternates.fr', 'https://portfolio.example/fr'.$path)
                    ->where('seo.robots', 'index, follow, max-image-preview:large'));
            $this->get($path ?: '/')->assertOk()->assertInertia(fn (Assert $page) => $page
                ->where('locale', 'en')->where('seo.alternates.fr', 'https://portfolio.example/fr'.$path));
        }
        $this->get('/fr')->assertInertia(fn (Assert $page) => $page
            ->where('cms.home.hero', "Conçu pour\nêtre exploré.")
            ->where('seo.title', 'Nakhle Rizk — Développeur full stack à Rouen, France'));
    }

    public function test_french_cms_drafts_remain_private_and_shared_contact_details_are_preserved(): void
    {
        CmsDocument::create(['key' => 'site', 'published' => ['email' => 'contact@example.com', 'latitude' => 49.45]]);
        CmsDocument::create(['key' => 'fr_home', 'published' => ['hero' => 'Bonjour'], 'draft' => ['hero' => 'Brouillon privé']]);
        $this->get('/fr?preview=1')->assertInertia(fn (Assert $page) => $page
            ->where('cms.home.hero', 'Bonjour')->where('cms.site.email', 'contact@example.com')->where('cms.site.latitude', 49.45));
        $this->get('/')->assertInertia(fn (Assert $page) => $page->where('cms.home.hero', config('cms.home.fields.hero.default')));
        $this->actingAs(User::factory()->create(['is_admin' => true]))->get('/fr?preview=1')
            ->assertInertia(fn (Assert $page) => $page->where('cms.home.hero', 'Brouillon privé')->where('seo.alternates', [])->where('seo.robots', 'noindex, nofollow'));
    }

    public function test_project_translations_feed_content_metadata_and_sitemap_without_indexing_missing_translations(): void
    {
        $project = Project::create(['title' => 'A project', 'description' => 'English summary', 'category' => 'Web', 'is_published' => true]);
        $path = '/work/'.$project->mongo_id;
        $this->get('/fr'.$path)->assertInertia(fn (Assert $page) => $page->where('seo.robots', 'noindex, nofollow'));
        $this->get($path)->assertInertia(fn (Assert $page) => $page->missing('seo.alternates.fr'));
        $this->get('/sitemap.xml')->assertDontSee('/fr'.$path);
        CmsDocument::create(['key' => 'fr_projects', 'published' => ['projects' => [['id' => $project->mongo_id, 'title' => 'Un projet', 'description' => 'Résumé français', 'longDescription' => 'Présentation complète.']]]]);
        $this->get('/fr'.$path)->assertInertia(fn (Assert $page) => $page
            ->where('project.title', 'Un projet')->where('project.longDescription', 'Présentation complète.')
            ->where('seo.title', 'Un projet — Projet de Nakhle Rizk')->where('seo.description', 'Résumé français')
            ->where('seo.alternates.en', 'https://portfolio.example'.$path));
        $this->get($path)->assertInertia(fn (Assert $page) => $page->where('project.title', 'A project')->where('seo.alternates.fr', 'https://portfolio.example/fr'.$path));
        $this->get('/sitemap.xml')->assertSee('/fr'.$path);
        $this->get('/fr/work?project='.$project->mongo_id)->assertRedirect('/fr'.$path);
        $project->update(['is_published' => false]);
        $this->get('/fr'.$path)->assertNotFound();
        $this->get('/sitemap.xml')->assertDontSee($project->mongo_id);
    }

    public function test_french_contact_validation_and_success_stay_in_french(): void
    {
        $this->postJson('/fr/contact', ['email' => 'invalid'])->assertUnprocessable()
            ->assertJsonPath('errors.email.0', 'Veuillez indiquer une adresse e-mail valide.');
        $this->post('/fr/contact', ['name' => 'Test', 'email' => 'visitor@example.com', 'message' => 'Bonjour, parlons de ce projet.', 'website' => ''])
            ->assertRedirect('/fr/contact')->assertSessionHas('success', 'Merci ! Votre message a bien été reçu.');
        $this->assertDatabaseHas('contact_messages', ['email' => 'visitor@example.com']);
    }

    public function test_map_configuration_and_policy_name_match_the_active_provider(): void
    {
        config(['services.google_maps.key' => '']);
        $this->get('/fr/contact')->assertInertia(fn (Assert $page) => $page->where('mapsKey', ''));
        $this->get('/privacy')->assertSee('OpenStreetMap');
        config(['services.google_maps.key' => 'browser-test-key']);
        $response = $this->get('/fr/contact')->assertInertia(fn (Assert $page) => $page->where('mapsKey', 'browser-test-key'));
        $this->assertStringContainsString('https://*.googleapis.com', $response->headers->get('Content-Security-Policy'));
        $this->get('/privacy')->assertSee('Google Maps')->assertDontSee('OpenStreetMap');
        $this->get('/fr/privacy')->assertSee('Google Maps');
    }

    public function test_manifest_link_points_to_a_deployable_json_file(): void
    {
        $this->get('/')->assertSee('rel="manifest" href="/manifest.json"', false)->assertDontSee('href="/site.webmanifest"', false);
        $manifest = json_decode(file_get_contents(public_path('manifest.json')), true, flags: JSON_THROW_ON_ERROR);
        foreach ($manifest['icons'] as $icon) {
            $this->assertFileExists(public_path(ltrim($icon['src'], '/')));
        }
    }
}
