<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Timeline;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PortfolioTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        Storage::fake('public');
    }

    private function admin(): User
    {
        return User::factory()->create(['is_admin' => true]);
    }

    private function payload(): array
    {
        return ['title' => 'Sample project', 'category' => 'Web Development', 'description' => 'Description', 'longDescription' => 'Details', 'technologies' => ['Vue', 'Laravel'], 'liveUrl' => 'https://example.com', 'githubUrl' => '', 'order' => 3];
    }

    private function project(): Project
    {
        return Project::create($this->payload());
    }

    public function test_public_pages_and_missing_routes(): void
    {
        $this->project();
        foreach (['/' => 'Home', '/about' => 'About', '/work' => 'Work', '/contact' => 'Contact', '/login' => 'Login'] as $path => $component) {
            $this->get($path)->assertOk()->assertInertia(fn (Assert $page) => $page->component($component));
        }
        $this->get('/unknown-page')->assertNotFound()->assertInertia(fn (Assert $page) => $page->component('NotFound'));
        $this->get('/health')->assertOk()->assertJson(['status' => 'ok', 'database' => 'ok']);
        $this->get('/sitemap.xml')->assertOk()->assertSee('/about');
    }

    public function test_project_details_preserve_content_and_legacy_links(): void
    {
        $project = $this->project();
        $this->get('/work/'.$project->mongo_id)->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Project')
            ->where('project.id', $project->mongo_id)
            ->where('project.longDescription', 'Details')
            ->where('project.technologies', ['Vue', 'Laravel'])
            ->missing('project.legacy_document'));
        $this->get('/work?project='.$project->mongo_id)->assertRedirect('/work/'.$project->mongo_id);
        $this->get('/work/missing')->assertNotFound();
    }

    public function test_public_api_preserves_ids_order_and_never_exposes_archive_fields(): void
    {
        $later = $this->project();
        $first = Project::create([...$this->payload(), 'title' => 'First', 'order' => -1, 'legacy_document' => ['private' => 'secret']]);
        $this->getJson('/api/projects')->assertOk()->assertJsonPath('0.id', $first->mongo_id)->assertJsonPath('1._id', $later->mongo_id)->assertJsonMissing(['legacy_document' => ['private' => 'secret']]);
        $this->getJson('/api/projects/'.$first->mongo_id)->assertOk()->assertJsonPath('title', 'First');
        $this->getJson('/api/projects/missing')->assertNotFound();
    }

    public function test_guests_and_non_admins_cannot_manage_content(): void
    {
        $project = $this->project();
        $this->get('/dashboard')->assertRedirect('/login');
        $this->post('/dashboard/projects', $this->payload())->assertRedirect('/login');
        $this->actingAs(User::factory()->create(['is_admin' => false]))->get('/dashboard')->assertForbidden();
        $this->put('/dashboard/projects/'.$project->mongo_id, $this->payload())->assertForbidden();
        $this->delete('/dashboard/projects/'.$project->mongo_id)->assertForbidden();
        $this->post('/dashboard/projects/'.$project->mongo_id.'/media', [])->assertForbidden();
    }

    public function test_legacy_bcrypt_password_authenticates_and_session_can_logout(): void
    {
        $user = $this->admin();
        $hash = Hash::make('migration-password');
        $user->setRawAttributes([...$user->getAttributes(), 'password' => '$2a$'.substr($hash, 4)]);
        $user->save();
        $this->post('/login', ['email' => $user->email, 'password' => 'migration-password'])->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($user);
        $this->post('/logout')->assertRedirect('/');
        $this->assertGuest();
    }

    public function test_bad_credentials_and_non_admin_login_are_rejected(): void
    {
        $user = User::factory()->create(['is_admin' => false, 'password' => 'migration-password']);
        $this->post('/login', ['email' => $user->email, 'password' => 'migration-password'])->assertSessionHasErrors('email');
        $admin = $this->admin();
        $this->post('/login', ['email' => $admin->email, 'password' => 'wrong'])->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_admin_can_create_update_and_delete_projects_including_clear_optional_fields(): void
    {
        $this->actingAs($this->admin());
        $this->post('/dashboard/projects', $this->payload())->assertRedirect();
        $project = Project::firstOrFail();
        $id = $project->mongo_id;
        $this->assertNotEmpty($id);
        $this->put('/dashboard/projects/'.$id, [...$this->payload(), 'title' => 'Changed', 'longDescription' => '', 'technologies' => [], 'liveUrl' => '', 'order' => 0])->assertRedirect('/dashboard');
        $project->refresh();
        $this->assertSame('Changed', $project->title);
        $this->assertNull($project->longDescription);
        $this->assertNull($project->liveUrl);
        $this->assertSame([], $project->technologies);
        $this->delete('/dashboard/projects/'.$id)->assertRedirect('/dashboard');
        $this->assertDatabaseCount('projects', 0);
    }

    public function test_invalid_projects_are_not_saved(): void
    {
        $this->actingAs($this->admin())->post('/dashboard/projects', [...$this->payload(), 'title' => '', 'liveUrl' => 'javascript:alert(1)'])->assertSessionHasErrors(['title', 'liveUrl']);
        $this->assertDatabaseCount('projects', 0);
    }

    public function test_timeline_crud_and_validation(): void
    {
        $this->actingAs($this->admin());
        $payload = ['year' => '2025 – Present', 'title' => 'Engineer', 'category' => 'work', 'location' => 'Rouen', 'description' => 'Details', 'bullets' => ['One', 'Two'], 'order' => 2];
        $this->post('/dashboard/timeline', $payload)->assertRedirect('/dashboard');
        $item = Timeline::firstOrFail();
        $this->getJson('/api/timeline/'.$item->mongo_id)->assertJsonPath('bullets.1', 'Two');
        $this->getJson('/api/timeline')->assertJsonCount(1);
        $this->put('/dashboard/timeline/'.$item->mongo_id, [...$payload, 'description' => '', 'bullets' => [], 'order' => 0])->assertRedirect('/dashboard');
        $this->assertSame([], $item->fresh()->bullets);
        $this->post('/dashboard/timeline', [...$payload, 'category' => 'invalid'])->assertSessionHasErrors('category');
        $this->delete('/dashboard/timeline/'.$item->mongo_id)->assertRedirect('/dashboard');
        $this->assertDatabaseCount('timelines', 0);
    }

    public function test_spatie_upload_is_local_and_can_only_be_removed_from_its_project(): void
    {
        $this->actingAs($this->admin());
        $project = $this->project();
        $response = $this->post('/dashboard/projects/'.$project->mongo_id.'/media', ['file' => UploadedFile::fake()->image('screenshot.png', 640, 480)]);
        $response->assertCreated()->assertJsonStructure(['id', 'url']);
        $media = $project->fresh()->getFirstMedia('images');
        $this->assertNotNull($media);
        Storage::disk('public')->assertExists($media->id.'/'.$media->file_name);
        $other = $this->project();
        $this->deleteJson('/dashboard/projects/'.$other->mongo_id.'/media/'.$media->id)->assertNotFound();
        $this->deleteJson('/dashboard/projects/'.$project->mongo_id.'/media/'.$media->id)->assertOk();
        Storage::disk('public')->assertMissing($media->id.'/'.$media->file_name);
    }

    public function test_non_images_and_oversized_uploads_are_rejected(): void
    {
        $this->actingAs($this->admin());
        $project = $this->project();
        $this->postJson('/dashboard/projects/'.$project->mongo_id.'/media', ['file' => UploadedFile::fake()->create('script.php', 1, 'text/x-php')])->assertUnprocessable()->assertJsonValidationErrors('file');
        $this->postJson('/dashboard/projects/'.$project->mongo_id.'/media', ['file' => UploadedFile::fake()->image('huge.png')->size(20481)])->assertUnprocessable();
        $this->assertDatabaseCount('media', 0);
    }

    public function test_project_delete_removes_media_files(): void
    {
        $project = $this->project();
        $media = $project->addMedia(UploadedFile::fake()->image('sample.png'))->toMediaCollection('images');
        $path = $media->id.'/'.$media->file_name;
        $this->actingAs($this->admin())->delete('/dashboard/projects/'.$project->mongo_id)->assertRedirect('/dashboard');
        Storage::disk('public')->assertMissing($path);
        $this->assertDatabaseCount('media', 0);
    }

    public function test_contact_is_stored_without_external_services_and_only_admin_sees_it(): void
    {
        $this->post('/contact', ['name' => 'Visitor', 'email' => 'visitor@example.com', 'message' => 'A new project enquiry.', 'website' => ''])->assertRedirect('/contact')->assertSessionHas('success');
        $this->assertDatabaseCount('contact_messages', 1);
        $this->actingAs($this->admin())->get('/dashboard')->assertOk()->assertInertia(fn (Assert $page) => $page->component('Dashboard')->has('messages.data', 1)->where('messages.data.0.name', 'Visitor')->missing('auth.user.password'));
    }

    public function test_contact_honeypot_and_validation(): void
    {
        $this->post('/contact', ['name' => 'Bot', 'email' => 'not-email', 'message' => 'short', 'website' => 'spam'])->assertSessionHasErrors(['email', 'message', 'website']);
        $this->assertDatabaseCount('contact_messages', 0);
    }

    public function test_login_rate_limit(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->post('/login', ['email' => 'missing@example.com', 'password' => 'wrong']);
        }
        $this->post('/login', ['email' => 'missing@example.com', 'password' => 'wrong'])->assertTooManyRequests();
    }
}
