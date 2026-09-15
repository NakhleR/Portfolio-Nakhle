<?php

namespace Tests\Feature;

use App\Models\AnalyticsConsent;
use App\Models\AnalyticsEvent;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AnalyticsReportTest extends TestCase
{
    use RefreshDatabase;

    private function consent(): string
    {
        return AnalyticsConsent::create(['id' => (string) Str::uuid(), 'analytics' => true, 'version' => AnalyticsConsent::VERSION, 'expires_at' => now()->addDays(180)])->id;
    }

    private function event(string $consent, array $overrides = []): AnalyticsEvent
    {
        return AnalyticsEvent::create(array_replace(['id' => (string) Str::uuid(), 'consent_id' => $consent, 'session_id' => (string) Str::uuid(), 'view_id' => (string) Str::uuid(), 'path' => '/', 'type' => 'page_view', 'device' => 'desktop', 'value' => 0, 'created_at' => now()], $overrides));
    }

    public function test_report_compares_periods_and_counts_engagement_without_duplicates(): void
    {
        $this->withoutVite();
        $this->travelTo(Carbon::parse('2026-09-14 14:00:00'));
        $returning = $this->consent();
        $new = $this->consent();
        $this->event($returning, ['created_at' => '2026-09-01 10:00:00']);
        $view = $this->event($returning, ['created_at' => '2026-09-08 10:00:00']);
        $this->event($new, ['path' => '/work', 'device' => 'mobile', 'created_at' => '2026-09-14 12:00:00']);
        $base = ['view_id' => $view->view_id, 'session_id' => $view->session_id, 'created_at' => '2026-09-08 10:01:00'];
        $this->event($returning, $base + ['type' => 'reading', 'section' => 'about', 'value' => 12]);
        foreach (range(1, 2) as $i) {
            $this->event($returning, $base + ['type' => 'click', 'section' => 'navigation', 'target' => 'cv-download']);
            $this->event($returning, $base + ['type' => 'scroll', 'value' => 75]);
        }
        $this->event($returning, ['created_at' => '2026-09-15 10:00:00']);
        $this->actingAs(User::factory()->create(['is_admin' => true]))->get('/dashboard/analytics?days=7')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('summary.views', 2)->where('summary.sessions', 2)->where('summary.reading', 12)->where('summary.clicks', 2)
            ->where('previous.views', 1)->where('engagement.engagedViews', 1)->where('engagement.rate', 50)->where('engagement.returning', 1)->where('engagement.new', 1)
            ->has('daily', 7)->where('daily.0.day', '2026-09-08')->where('daily.0.previous.views', 1)->where('daily.1.views', 0)
            ->where('intents.1.clicks', 2)->where('intents.1.sessions', 1)
            ->where('depth.0.views', 1)->has('activity', 2)->has('pages', 2));
        $this->get('/dashboard/analytics?days=7&path=/work&device=mobile')->assertOk()->assertInertia(fn (Assert $page) => $page->where('summary.views', 1)->where('summary.clicks', 0)->where('previous.views', 0)->where('engagement.rate', 0)->where('engagement.new', 1)->where('activity.0.weekday', 0)->where('activity.0.hour', 12)->where('pages.0.deepViews', 0));
    }

    public function test_retention_limited_comparisons_and_empty_reports_are_explicit(): void
    {
        $this->withoutVite();
        $this->travelTo(Carbon::parse('2026-09-14 14:00:00'));
        $consent = $this->consent();
        $this->event($consent, ['created_at' => now()->subDays(91)]);
        $this->event($consent);
        $this->actingAs(User::factory()->create(['is_admin' => true]))->get('/dashboard/analytics?days=90')->assertOk()->assertInertia(fn (Assert $page) => $page->where('summary.views', 1)->where('previous', null)->where('period.previousStart', null)->where('engagement.returning', 0)->has('daily', 90)->where('daily.0.previous', null));
        $this->get('/dashboard/analytics?days=30&device=tablet')->assertOk()->assertInertia(fn (Assert $page) => $page->where('summary.views', 0)->where('summary.reading', 0)->where('previous.views', 0)->where('engagement.pagesPerSession', 0)->where('engagement.rate', 0)->has('devices', 0)->has('activity', 0)->has('intents', 5));
    }
}
