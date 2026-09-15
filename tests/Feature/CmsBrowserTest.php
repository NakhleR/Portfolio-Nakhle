<?php

namespace Tests\Feature;

use App\Models\AnalyticsConsent;
use App\Models\AnalyticsEvent;
use App\Models\ContactMessage;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\Process\Process;
use Tests\TestCase;

class CmsBrowserTest extends TestCase
{
    public function test_cms_workflows_in_a_browser_with_an_isolated_database(): void
    {
        if (! getenv('CMS_BROWSER_TEST')) {
            $this->markTestSkipped('Run with CMS_BROWSER_TEST=1 and Python Playwright installed.');
        }
        $database = tempnam(sys_get_temp_dir(), 'cms-review-');
        config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => $database]);
        DB::purge('sqlite');
        $this->artisan('migrate', ['--force' => true])->assertSuccessful();
        User::factory()->create(['name' => 'CMS test reviewer', 'email' => 'cms-review@example.test', 'password' => 'ReviewPassword!42', 'is_admin' => true]);
        Project::create(['title' => 'Sample browser test project', 'category' => 'Web Development', 'description' => 'Fixture data for isolated CMS browser tests.', 'order' => 1, 'is_published' => true]);
        ContactMessage::create(['name' => 'Sample enquiry', 'email' => 'sample@example.test', 'message' => 'This is sample data for testing the enquiry workflow.']);
        $consent = AnalyticsConsent::create(['id' => (string) Str::uuid(), 'analytics' => true, 'version' => AnalyticsConsent::VERSION, 'expires_at' => now()->addDays(30)]);
        foreach (range(0, 29) as $day) {
            foreach (range(0, ($day * 7) % 11) as $visit) {
                $view = AnalyticsEvent::create(['id' => (string) Str::uuid(), 'consent_id' => $consent->id, 'session_id' => (string) Str::uuid(), 'view_id' => (string) Str::uuid(), 'path' => ['/', '/work', '/contact'][$visit % 3], 'type' => 'page_view', 'device' => ['desktop', 'mobile', 'tablet'][$visit % 3], 'value' => 0, 'created_at' => now()->subDays($day)->subHours($visit)]);
                if ($visit % 2 === 0) {
                    $context = $view->only(['consent_id', 'session_id', 'view_id', 'path', 'device', 'created_at']);
                    AnalyticsEvent::create($context + ['id' => (string) Str::uuid(), 'type' => 'reading', 'section' => ['hero', 'about', 'projects'][$visit % 3], 'value' => 12]);
                    AnalyticsEvent::create($context + ['id' => (string) Str::uuid(), 'type' => 'click', 'section' => 'navigation', 'target' => ['project', 'cv-download', 'email'][$visit % 3], 'value' => 0, 'x' => 20 + $visit * 5, 'y' => 15 + $visit * 7]);
                    foreach ([25, 50, 75] as $depth) {
                        AnalyticsEvent::create($context + ['id' => (string) Str::uuid(), 'type' => 'scroll', 'value' => $depth]);
                    }
                }
            }
        }
        $socket = stream_socket_server('tcp://127.0.0.1:0');
        $address = stream_socket_get_name($socket, false);
        fclose($socket);
        $server = new Process([PHP_BINARY, '-S', $address, '-t', public_path(), base_path('scripts/serve.php')], base_path(), ['APP_ENV' => 'local', 'APP_DEBUG' => 'false', 'APP_KEY' => 'base64:'.base64_encode(random_bytes(32)), 'APP_URL' => 'http://'.$address, 'DB_CONNECTION' => 'sqlite', 'DB_DATABASE' => $database, 'DB_URL' => '', 'SESSION_DRIVER' => 'database', 'SESSION_ENCRYPT' => 'false', 'SESSION_SECURE_COOKIE' => 'false', 'CACHE_STORE' => 'array', 'INERTIA_SSR_ENABLED' => 'false']);
        $server->start();
        try {
            $this->assertTrue($server->waitUntil(fn (string $type, string $output) => str_contains($output, 'Development Server')));
            $browser = new Process([getenv('CMS_BROWSER_PYTHON') ?: 'python', base_path('tests/Browser/cms.py'), 'http://'.$address, base_path('.impeccable/review/screenshots')], base_path());
            $browser->setTimeout(180);
            $browser->run();
            $this->assertTrue($browser->isSuccessful(), $browser->getOutput().$browser->getErrorOutput());
        } finally {
            $server->stop();
            DB::disconnect('sqlite');
            @unlink($database);
        }
    }
}
