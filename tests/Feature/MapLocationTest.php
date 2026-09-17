<?php

namespace Tests\Feature;

use App\Models\CmsDocument;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MapLocationTest extends TestCase
{
    use RefreshDatabase;

    public function test_contact_pages_default_to_rue_de_fontenelle(): void
    {
        $this->withoutVite();

        foreach (['/contact', '/fr/contact'] as $path) {
            $this->get($path)->assertInertia(fn (Assert $page) => $page
                ->where('cms.site.latitude', 49.44303)
                ->where('cms.site.longitude', 1.08613)
                ->where('cms.site.map_label', 'Rue de Fontenelle, 76000 Rouen'));
        }
    }

    public function test_migration_corrects_saved_coordinates_without_publishing_draft_content(): void
    {
        $published = ['latitude' => '49.4431', 'longitude' => '1.0993', 'map_label' => 'Rouen, France', 'email' => 'public@example.com'];
        $draft = [...$published, 'email' => 'draft@example.com', 'map_label' => 'My location'];
        $document = CmsDocument::create(['key' => 'site', 'published' => $published, 'draft' => $draft, 'version' => 4]);
        $migration = require database_path('migrations/2026_09_17_172449_correct_fontenelle_map_coordinates.php');

        $migration->up();

        $document->refresh();
        $this->assertSame([...$published, 'latitude' => 49.44303, 'longitude' => 1.08613, 'map_label' => 'Rue de Fontenelle, 76000 Rouen'], $document->published);
        $this->assertSame([...$draft, 'latitude' => 49.44303, 'longitude' => 1.08613], $document->draft);
        $this->assertSame(5, $document->version);

        $migration->up();

        $this->assertSame(5, $document->fresh()->version);
    }

    public function test_migration_preserves_custom_coordinates_and_empty_drafts(): void
    {
        $published = ['latitude' => 49.45, 'longitude' => 1.08, 'map_label' => 'Custom location'];
        $document = CmsDocument::create(['key' => 'site', 'published' => $published, 'draft' => null, 'version' => 2]);
        $migration = require database_path('migrations/2026_09_17_172449_correct_fontenelle_map_coordinates.php');

        $migration->up();

        $document->refresh();
        $this->assertSame($published, $document->published);
        $this->assertNull($document->draft);
        $this->assertSame(2, $document->version);
    }
}
