<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MapLoadBudgetTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        config(['services.google_maps.key' => 'test-browser-key', 'services.google_maps.monthly_limit' => 2]);
        $this->travelTo(now('America/Los_Angeles')->setDate(2026, 9, 17)->startOfDay());
    }

    public function test_google_stops_at_the_shared_monthly_allowance(): void
    {
        $this->postJson('/maps/access')->assertExactJson(['provider' => 'google', 'key' => 'test-browser-key']);
        $this->postJson('/maps/access')->assertExactJson(['provider' => 'google', 'key' => 'test-browser-key']);
        $this->postJson('/maps/access')->assertExactJson(['provider' => 'leaflet'])->assertHeader('Cache-Control', 'no-store, private');
        $this->assertDatabaseHas('map_load_budgets', ['month' => '2026-09', 'reserved_loads' => 2]);

        Cache::flush();

        $this->postJson('/maps/access')->assertExactJson(['provider' => 'leaflet']);
    }

    public function test_allowance_resets_at_midnight_pacific_on_the_first_of_the_month(): void
    {
        DB::table('map_load_budgets')->insert(['month' => '2026-09', 'reserved_loads' => 2]);
        $this->travelTo(now('UTC')->setDate(2026, 10, 1)->setTime(6, 59, 59));
        $this->postJson('/maps/access')->assertExactJson(['provider' => 'leaflet']);

        $this->travelTo(now('UTC')->setDate(2026, 10, 1)->setTime(7, 0, 0));

        $this->postJson('/maps/access')->assertExactJson(['provider' => 'google', 'key' => 'test-browser-key']);
        $this->assertDatabaseHas('map_load_budgets', ['month' => '2026-10', 'reserved_loads' => 1]);
    }

    public function test_disabled_budget_and_missing_key_use_leaflet_without_reserving(): void
    {
        config(['services.google_maps.monthly_limit' => 0]);
        $this->postJson('/maps/access')->assertExactJson(['provider' => 'leaflet']);
        config(['services.google_maps.monthly_limit' => 2, 'services.google_maps.key' => '']);
        $this->postJson('/maps/access')->assertExactJson(['provider' => 'leaflet']);
        $this->assertDatabaseCount('map_load_budgets', 0);
    }

    public function test_page_rendering_does_not_spend_allowance_or_expose_a_key(): void
    {
        foreach (['/contact', '/fr/contact'] as $path) {
            $this->get($path)->assertInertia(fn (Assert $page) => $page
                ->missing('mapsKey')->where('mapsAccessUrl', '/maps/access'));
        }
        $this->assertDatabaseCount('map_load_budgets', 0);
    }

    public function test_overlarge_configuration_still_stops_at_nine_thousand(): void
    {
        config(['services.google_maps.monthly_limit' => 100000]);
        DB::table('map_load_budgets')->insert(['month' => '2026-09', 'reserved_loads' => 9000]);

        $this->postJson('/maps/access')->assertExactJson(['provider' => 'leaflet']);
    }

    public function test_unavailable_budget_storage_fails_closed_to_leaflet(): void
    {
        Schema::drop('map_load_budgets');

        $this->postJson('/maps/access')->assertExactJson(['provider' => 'leaflet']);
    }
}
