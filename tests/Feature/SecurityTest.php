<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        Storage::fake('public');
    }

    public function test_security_headers_and_script_nonces_cover_pages_and_errors(): void
    {
        $first = $this->get('/')->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY');
        $policy = $first->headers->get('Content-Security-Policy');
        preg_match("/script-src [^;]*'nonce-([^']+)'/", $policy, $matches);
        $this->assertNotEmpty($matches[1]);
        $first->assertSee('nonce="'.$matches[1].'"', false);
        $this->assertStringNotContainsString("'unsafe-eval'", $policy);
        $this->assertStringContainsString("frame-ancestors 'none'", $policy);
        $this->assertStringContainsString("object-src 'none'", $policy);
        $second = $this->get('/login')->assertOk();
        $this->assertNotSame($policy, $second->headers->get('Content-Security-Policy'));
        $this->get('/work/not-found')->assertNotFound()->assertHeader('X-Content-Type-Options', 'nosniff');
    }

    public function test_dashboard_and_analytics_responses_cannot_be_cached(): void
    {
        $this->actingAs(User::factory()->create(['is_admin' => true]));
        foreach (['/dashboard', '/dashboard/analytics', '/'] as $path) {
            $response = $this->get($path)->assertOk();
            $this->assertTrue($response->headers->hasCacheControlDirective('no-store'));
            $this->assertTrue($response->headers->hasCacheControlDirective('private'));
        }
    }

    public function test_production_rejects_unconfigured_hosts_and_sets_hsts_only_over_https(): void
    {
        config(['app.url' => 'https://portfolio.example']);
        $this->app->instance('env', 'production');
        try {
            $this->get('https://portfolio.example/')->assertOk()->assertHeader('Strict-Transport-Security', 'max-age=31536000');
            $this->get('http://portfolio.example/')->assertOk()->assertHeaderMissing('Strict-Transport-Security');
            $this->get('https://attacker.example/')->assertStatus(400);
        } finally {
            $this->app->instance('env', 'testing');
            Request::setTrustedHosts([]);
        }
    }

    public function test_login_failures_are_limited_across_different_ip_addresses(): void
    {
        $admin = User::factory()->create(['is_admin' => true, 'password' => 'correct-password']);
        for ($attempt = 1; $attempt <= 10; $attempt++) {
            $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.'.$attempt])
                ->postJson('/login', ['email' => $admin->email, 'password' => 'incorrect'])
                ->assertUnprocessable();
        }
        $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.11'])
            ->postJson('/login', ['email' => strtoupper($admin->email), 'password' => 'correct-password'])
            ->assertStatus(429);
        $this->assertGuest();
        $this->travel(16)->minutes();
        $this->post('/login', ['email' => $admin->email, 'password' => 'correct-password'])->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($admin);
    }

    public function test_successful_login_clears_failed_attempts_and_oversized_credentials_are_rejected(): void
    {
        $admin = User::factory()->create(['is_admin' => true, 'password' => 'correct-password']);
        $key = 'login-account:'.hash('sha256', mb_strtolower($admin->email));
        $this->post('/login', ['email' => $admin->email, 'password' => 'incorrect'])->assertSessionHasErrors('email');
        $this->assertSame(1, RateLimiter::attempts($key));
        $this->post('/login', ['email' => $admin->email, 'password' => 'correct-password'])->assertRedirect('/dashboard');
        $this->assertSame(0, RateLimiter::attempts($key));
        $this->post('/logout');
        $this->postJson('/login', ['email' => $admin->email, 'password' => str_repeat('a', 1025)])
            ->assertUnprocessable()->assertJsonValidationErrors('password');
    }

    public function test_uploads_reject_active_files_disguised_extensions_and_excessive_dimensions(): void
    {
        $this->actingAs(User::factory()->create(['is_admin' => true]));
        $project = Project::create(['title' => 'Test', 'category' => 'Web', 'description' => 'Test', 'order' => 1]);
        $url = '/dashboard/projects/'.$project->mongo_id.'/media';
        $png = UploadedFile::fake()->image('sample.png', 32, 32);
        foreach (['image.php', 'image.html', 'image.svg'] as $filename) {
            $this->postJson($url, ['file' => new UploadedFile($png->getPathname(), $filename, 'image/png', null, true)])
                ->assertUnprocessable()->assertJsonValidationErrors('file');
        }
        $this->postJson($url, ['file' => UploadedFile::fake()->createWithContent('fake.png', '<script>alert(1)</script>')])
            ->assertUnprocessable();
        foreach ([[7000, 10], [5000, 5000]] as [$width, $height]) {
            $bytes = file_get_contents($png->getPathname());
            $bytes = substr_replace($bytes, pack('NN', $width, $height), 16, 8);
            $this->postJson($url, ['file' => UploadedFile::fake()->createWithContent('oversized.png', $bytes)])
                ->assertUnprocessable()->assertJsonValidationErrors('file');
        }
        $this->assertDatabaseCount('media', 0);
        $this->postJson($url, ['file' => new UploadedFile($png->getPathname(), 'original.php.png', 'image/png', null, true)])
            ->assertCreated();
        $media = $project->fresh()->getFirstMedia('images');
        $this->assertMatchesRegularExpression('/^[a-f0-9-]{36}\\.png$/', $media->file_name);
        $this->assertStringNotContainsString('php', $media->file_name);
    }

    public function test_private_history_is_encrypted_and_logout_clears_previous_history(): void
    {
        $this->actingAs(User::factory()->create(['is_admin' => true]));
        $initial = $this->get('/dashboard')->assertOk();
        $this->assertTrue($initial->viewData('page')['encryptHistory']);
        $this->withHeaders(['X-Inertia' => 'true', 'X-Inertia-Version' => $initial->viewData('page')['version']]);
        $this->post('/logout')->assertRedirect('/');
        $this->get('/')->assertOk()->assertJsonPath('clearHistory', true)->assertJsonMissingPath('encryptHistory');
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_public_mutations_require_csrf_protection(): void
    {
        $this->app->bind(PreventRequestForgery::class, fn ($app) => new class($app, $app['encrypter']) extends PreventRequestForgery
        {
            protected function runningUnitTests()
            {
                return false;
            }
        });
        foreach (['/login', '/contact', '/privacy/consent', '/privacy/erase-analytics', '/analytics/events'] as $path) {
            $this->postJson($path, [])->assertStatus(419);
        }
        $this->assertDatabaseCount('analytics_events', 0);
        $this->assertDatabaseCount('contact_messages', 0);
    }
}
