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

    public function test_homepage_uses_the_highest_priority_supported_browser_language(): void
    {
        foreach (['fr-FR,fr;q=0.9,en;q=0.8', 'de-DE,fr-CA;q=0.8,en;q=0.5', 'en;q=0.3,fr-BE;q=0.9'] as $languages) {
            $this->get('/?utm_source=profile', ['Accept-Language' => $languages])
                ->assertStatus(302)
                ->assertRedirect('/fr?utm_source=profile')
                ->assertHeader('Cache-Control', 'no-store, private');
        }

        foreach (['en-GB,fr;q=0.8', 'de-DE', '', 'fr;q=0,en;q=0.5', '*'] as $languages) {
            $this->get('/', ['Accept-Language' => $languages])->assertOk()
                ->assertInertia(fn (Assert $page) => $page->where('locale', 'en'));
        }
    }

    public function test_manual_language_choices_override_detection_for_the_session(): void
    {
        $this->get('/?lang=en&utm_source=profile', ['Accept-Language' => 'fr-FR'])
            ->assertRedirect(url('/').'/?utm_source=profile')->assertSessionHas('preferred_locale', 'en');
        $this->get('/', ['Accept-Language' => 'fr-FR'])->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('locale', 'en'));

        $this->get('/fr/contact?lang=fr')->assertRedirect('/fr/contact')
            ->assertSessionHas('preferred_locale', 'fr');
        $this->get('/', ['Accept-Language' => 'en-US'])->assertRedirect('/fr');
    }

    public function test_direct_language_urls_remain_accessible_regardless_of_preferences(): void
    {
        $this->withSession(['preferred_locale' => 'en'])->get('/fr', ['Accept-Language' => 'en-US'])
            ->assertOk()->assertInertia(fn (Assert $page) => $page->where('locale', 'fr'));
        $this->withSession(['preferred_locale' => 'fr'])->get('/contact', ['Accept-Language' => 'fr-FR'])
            ->assertOk()->assertInertia(fn (Assert $page) => $page->where('locale', 'en'));
        $this->get('/sitemap.xml', ['Accept-Language' => 'fr-FR'])->assertOk()->assertSee('/fr/contact');
        $this->get('/login?lang=en')->assertOk()->assertSessionHas('preferred_locale', 'fr');
    }

    public function test_invalid_language_choices_do_not_override_browser_detection(): void
    {
        $this->get('/?lang[]=en', ['Accept-Language' => 'fr-FR'])
            ->assertRedirect('/fr')->assertSessionMissing('preferred_locale');
        $this->get('/?lang=de', ['Accept-Language' => 'fr-FR'])
            ->assertRedirect('/fr')->assertSessionMissing('preferred_locale');
    }

    public function test_country_headers_do_not_override_browser_language(): void
    {
        foreach (['173.245.48.10', '2606:4700::1234'] as $proxyAddress) {
            $this->withServerVariables(['REMOTE_ADDR' => $proxyAddress])
                ->get('/', ['CF-IPCountry' => 'FR', 'Accept-Language' => 'en-US'])
                ->assertOk()->assertInertia(fn (Assert $page) => $page->where('locale', 'en'));
        }

        $this->get('/', ['CF-IPCountry' => 'US', 'Accept-Language' => 'fr-FR'])
            ->assertRedirect('/fr');
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
        config(['services.google_maps.key' => 'browser-test-key']);
        $response = $this->get('/fr/contact')->assertInertia(fn (Assert $page) => $page->missing('mapsKey')->where('mapsAccessUrl', '/maps/access'));
        $this->assertStringContainsString('https://*.googleapis.com', $response->headers->get('Content-Security-Policy'));
        $this->assertStringContainsString('tile.openstreetmap.org', $response->headers->get('Content-Security-Policy'));
        $this->get('/privacy')->assertSee('loads automatically')->assertSee('Google Maps or OpenStreetMap');
        $this->get('/fr/privacy')->assertSee('se charge automatiquement')->assertSee('Google Maps ou OpenStreetMap');
        $this->get('/cookies')->assertSee('loads automatically');
        $this->get('/fr/cookies')->assertSee('se charge automatiquement');
        config(['services.google_maps.key' => '']);
        $response = $this->get('/contact')->assertInertia(fn (Assert $page) => $page->missing('mapsKey'));
        $this->assertStringNotContainsString('googleapis.com', $response->headers->get('Content-Security-Policy'));
    }

    public function test_saved_map_notices_reflect_automatic_loading(): void
    {
        CmsDocument::create(['key' => 'privacy', 'published' => ['sections' => [
            ['heading' => 'Map', 'body' => 'The interactive map connects to OpenStreetMap only when you choose to load it.'],
        ]]]);
        CmsDocument::create(['key' => 'cookies', 'published' => ['sections' => [
            ['heading' => 'Map', 'body' => 'The map stays inactive until you request it. Loading it contacts OpenStreetMap.'],
        ]]]);
        CmsDocument::create(['key' => 'fr_privacy', 'published' => ['sections' => [
            ['heading' => 'Carte', 'body' => 'La carte ne contacte {{map_provider}} que lorsque vous demandez son chargement ; celui-ci reçoit alors notamment votre adresse IP.'],
        ]]]);
        CmsDocument::create(['key' => 'fr_cookies', 'published' => ['sections' => [
            ['heading' => 'Carte', 'body' => 'La carte reste inactive jusqu’à votre demande. Son chargement contacte {{map_provider}}.'],
        ]]]);

        $this->get('/privacy')->assertSee('loads automatically')->assertDontSee('only when you choose');
        $this->get('/cookies')->assertSee('loads automatically')->assertDontSee('stays inactive');
        $this->get('/fr/privacy')->assertSee('se charge automatiquement')->assertDontSee('que lorsque vous demandez');
        $this->get('/fr/cookies')->assertSee('se charge automatiquement')->assertDontSee('reste inactive');
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
