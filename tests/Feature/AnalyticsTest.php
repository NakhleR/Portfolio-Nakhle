<?php

namespace Tests\Feature;

use App\Models\AnalyticsConsent;
use App\Models\AnalyticsEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->withCredentials();
    }

    private function consent(bool $allowed = true): AnalyticsConsent
    {
        return AnalyticsConsent::create(['id' => (string) Str::uuid(), 'analytics' => $allowed, 'version' => AnalyticsConsent::VERSION, 'expires_at' => now()->addDays(180)]);
    }

    private function event(array $overrides = []): array
    {
        return array_replace(['id' => (string) Str::uuid(), 'session_id' => (string) Str::uuid(), 'view_id' => (string) Str::uuid(), 'path' => '/', 'type' => 'page_view', 'device' => 'desktop'], $overrides);
    }

    public function test_tracking_requires_current_explicit_consent(): void
    {
        $this->postJson('/analytics/events', ['events' => [$this->event()]])->assertForbidden();
        foreach (['denied', 'expired', 'old-version'] as $state) {
            $consent = $this->consent($state !== 'denied');
            if ($state === 'expired') {
                $consent->update(['expires_at' => now()->subDay()]);
            }
            if ($state === 'old-version') {
                $consent->update(['version' => 'old']);
            }
            $this->withCookie(AnalyticsConsent::COOKIE, $consent->id)->postJson('/analytics/events', ['events' => [$this->event()]])->assertForbidden();
        }
        $this->assertDatabaseCount('analytics_events', 0);
    }

    public function test_choice_is_remembered_and_can_be_withdrawn(): void
    {
        $response = $this->postJson('/privacy/consent', ['analytics' => true])->assertOk()->assertJson(['analytics' => true]);
        $cookie = $response->getCookie(AnalyticsConsent::COOKIE);
        $this->assertTrue($cookie->isHttpOnly());
        $this->assertSame('lax', $cookie->getSameSite());
        $this->withCookie(AnalyticsConsent::COOKIE, $cookie->getValue())->postJson('/privacy/consent', ['analytics' => false])->assertOk()->assertJson(['analytics' => false]);
        $this->postJson('/analytics/events', ['events' => [$this->event()]])->assertForbidden();
    }

    public function test_events_are_deduplicated_and_store_only_validated_fields(): void
    {
        $consent = $this->consent();
        $event = $this->event(['type' => 'reading', 'value' => 99, 'section' => 'about']);
        $this->withCookie(AnalyticsConsent::COOKIE, $consent->id)->postJson('/analytics/events', ['events' => [$event]])->assertNoContent();
        $this->postJson('/analytics/events', ['events' => [$event]])->assertNoContent();
        $this->assertDatabaseCount('analytics_events', 1);
        $this->assertDatabaseHas('analytics_events', ['id' => $event['id'], 'value' => 15, 'section' => 'about']);
        $row = AnalyticsEvent::first()->toArray();
        foreach (['ip', 'user_agent', 'email', 'referrer'] as $field) {
            $this->assertArrayNotHasKey($field, $row);
        }
    }

    public function test_french_public_paths_are_accepted_with_consent(): void
    {
        $consent = $this->consent();
        $this->withCookie(AnalyticsConsent::COOKIE, $consent->id);
        foreach (['/fr', '/fr/about', '/fr/work/project-123', '/fr/contact', '/fr/privacy'] as $path) {
            $this->postJson('/analytics/events', ['events' => [$this->event(['path' => $path])]])->assertNoContent();
            $this->assertDatabaseHas('analytics_events', ['path' => $path]);
        }
    }

    public function test_sensitive_or_invalid_payloads_are_rejected(): void
    {
        $consent = $this->consent();
        $this->withCookie(AnalyticsConsent::COOKIE, $consent->id);
        foreach ([['path' => '/dashboard'], ['path' => '/fr/dashboard'], ['path' => '/fr/contact?email=private@example.com'], ['path' => '/contact?email=private@example.com'], ['target' => 'private text'], ['email' => 'private@example.com'], ['x' => 101]] as $invalid) {
            $this->postJson('/analytics/events', ['events' => [$this->event($invalid)]])->assertUnprocessable();
        }
        $this->postJson('/analytics/events', ['events' => array_fill(0, 21, $this->event())])->assertUnprocessable();
        $this->assertDatabaseCount('analytics_events', 0);
    }

    public function test_privacy_signals_and_admin_sessions_disable_tracking(): void
    {
        $consent = $this->consent();
        $this->withCookie(AnalyticsConsent::COOKIE, $consent->id)->withHeader('Sec-GPC', '1')->postJson('/analytics/events', ['events' => [$this->event()]])->assertForbidden();
        $this->postJson('/privacy/consent', ['analytics' => true])->assertJson(['analytics' => false]);
        $this->flushHeaders();
        $this->actingAs(User::factory()->create(['is_admin' => true]))->postJson('/analytics/events', ['events' => [$this->event()]])->assertForbidden();
    }

    public function test_erasure_only_deletes_the_current_browser_data_and_revokes(): void
    {
        $a = $this->consent();
        $b = $this->consent();
        foreach ([$a, $b] as $consent) {
            AnalyticsEvent::create($this->event() + ['consent_id' => $consent->id, 'created_at' => now()]);
        }
        $this->withCookie(AnalyticsConsent::COOKIE, $a->id)->postJson('/privacy/erase-analytics')->assertOk();
        $this->assertDatabaseCount('analytics_events', 1);
        $this->assertDatabaseHas('analytics_events', ['consent_id' => $b->id]);
        $this->assertFalse($a->fresh()->analytics);
    }

    public function test_dashboard_is_admin_only_and_reports_aggregates(): void
    {
        $this->get('/dashboard/analytics')->assertRedirect('/login');
        $this->actingAs(User::factory()->create(['is_admin' => false]))->get('/dashboard/analytics')->assertForbidden();
        $consent = $this->consent();
        $view = $this->event();
        AnalyticsEvent::create($view + ['consent_id' => $consent->id, 'created_at' => now()]);
        AnalyticsEvent::create($this->event(['view_id' => $view['view_id'], 'type' => 'reading', 'section' => 'about', 'value' => 10]) + ['consent_id' => $consent->id, 'created_at' => now()]);
        $this->actingAs(User::factory()->create(['is_admin' => true]))->get('/dashboard/analytics?days=7&path=/&device=desktop')->assertOk()->assertInertia(fn (Assert $page) => $page->component('Analytics')->where('summary.views', 1)->where('summary.sessions', 1)->where('summary.visitors', 1)->where('summary.reading', fn ($value) => (int) $value === 10)->has('sections', 1));
    }

    public function test_retention_prunes_old_data_but_keeps_recent_events(): void
    {
        $consent = $this->consent();
        AnalyticsEvent::create($this->event() + ['consent_id' => $consent->id, 'created_at' => now()->subDays(91)]);
        AnalyticsEvent::create($this->event() + ['consent_id' => $consent->id, 'created_at' => now()]);
        $expired = $this->consent();
        $expired->update(['expires_at' => now()->subDay()]);
        $this->artisan('analytics:prune')->assertSuccessful();
        $this->assertDatabaseCount('analytics_events', 1);
        $this->assertDatabaseMissing('analytics_consents', ['id' => $expired->id]);
    }

    public function test_legal_pages_are_public_with_correct_metadata(): void
    {
        foreach (['privacy', 'cookies', 'terms', 'legal'] as $document) {
            $this->get('/'.$document)->assertOk()->assertInertia(fn (Assert $page) => $page->component('Legal')->where('document', $document)->where('privacy.analytics', null));
        }
    }
}
