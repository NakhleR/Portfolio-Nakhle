<?php

namespace Tests\Feature;

use App\Models\CmsDocument;
use App\Models\CmsRevision;
use App\Models\ContactMessage;
use App\Models\Project;
use App\Models\User;
use App\Services\CmsContent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CmsTest extends TestCase
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

    private function project(array $extra = []): Project
    {
        return Project::create([...['title' => 'CMS test project', 'category' => 'Web', 'description' => 'Public description', 'order' => 1], ...$extra]);
    }

    public function test_cms_routes_require_an_administrator(): void
    {
        foreach (['/dashboard/pages/home', '/dashboard/inbox', '/dashboard/media', '/dashboard/account'] as $path) {
            $this->get($path)->assertRedirect('/login');
        }
        $this->actingAs(User::factory()->create(['is_admin' => false]));
        foreach (['/dashboard/pages/home', '/dashboard/inbox', '/dashboard/media', '/dashboard/account'] as $path) {
            $this->get($path)->assertForbidden();
        }
        $this->put('/dashboard/pages/home', [])->assertForbidden();
        $this->post('/dashboard/pages/home/publish', [])->assertForbidden();
        $this->post('/dashboard/assets/cv', [])->assertForbidden();
    }

    public function test_all_editors_preserve_defaults_and_serve_a_valid_schema(): void
    {
        $this->actingAs($this->admin());
        foreach (array_keys(config('cms')) as $section) {
            $this->get('/dashboard/pages/'.$section)->assertOk()->assertInertia(fn (Assert $page) => $page->component('CmsEditor')->where('version', 0)->has('definition.fields')->where('data', app(CmsContent::class)->defaults($section)));
        }
        $this->get('/dashboard/pages/unknown')->assertNotFound();
        $this->assertDatabaseCount('cms_documents', 0);
    }

    public function test_drafts_are_private_and_publication_revisions_and_conflicts_work(): void
    {
        $admin = $this->admin();
        $data = app(CmsContent::class)->defaults('home');
        $original = $data['hero'];
        $data['hero'] = 'Private draft heading';
        $this->actingAs($admin)->from('/dashboard/pages/home')->put('/dashboard/pages/home', ['data' => $data, 'version' => 0])->assertSessionHasNoErrors();
        $this->get('/?preview=1')->assertInertia(fn (Assert $page) => $page->where('cms.home.hero', 'Private draft heading')->where('seo.robots', 'noindex, nofollow'));
        Auth::forgetGuards();
        $this->get('/?preview=1')->assertInertia(fn (Assert $page) => $page->where('cms.home.hero', $original)->where('cmsPreview', false));
        $this->actingAs($admin)->post('/dashboard/pages/home/publish', ['version' => 0])->assertSessionHasErrors('version');
        $this->post('/dashboard/pages/home/publish', ['version' => 1])->assertSessionHasNoErrors();
        $this->assertDatabaseCount('cms_revisions', 2);
        Auth::forgetGuards();
        $this->get('/')->assertInertia(fn (Assert $page) => $page->where('cms.home.hero', 'Private draft heading'));
        $this->actingAs($admin)->post('/dashboard/pages/home/restore/'.CmsRevision::oldest('id')->first()->id, ['version' => 2])->assertSessionHasNoErrors();
        $this->assertSame($original, CmsDocument::find('home')->draft['hero']);
        $this->get('/')->assertInertia(fn (Assert $page) => $page->where('cms.home.hero', 'Private draft heading'));
    }

    public function test_schema_rejects_unknown_keys_unsafe_urls_and_empty_repeaters(): void
    {
        $this->actingAs($this->admin());
        $data = app(CmsContent::class)->defaults('site');
        $this->putJson('/dashboard/pages/site', ['version' => 0, 'data' => [...$data, 'github' => 'javascript:alert(1)']])->assertUnprocessable()->assertJsonValidationErrors('data.github');
        $this->putJson('/dashboard/pages/site', ['version' => 0, 'data' => [...$data, 'private_key' => 'unexpected']])->assertUnprocessable();
        $home = app(CmsContent::class)->defaults('home');
        $home['disciplines'] = [];
        $this->putJson('/dashboard/pages/home', ['version' => 0, 'data' => $home])->assertUnprocessable();
        $this->assertDatabaseCount('cms_documents', 0);
    }

    public function test_about_drafts_accept_local_svg_icons_and_reject_unsafe_paths(): void
    {
        $this->actingAs($this->admin());
        $data = app(CmsContent::class)->defaults('about');
        $data['skills'][0]['items'][0]['imagePath'] = '/technology-icons/pytorch.svg';

        $this->put('/dashboard/pages/about', ['version' => 0, 'data' => $data])->assertSessionHasNoErrors();
        $this->assertSame('/technology-icons/pytorch.svg', CmsDocument::find('about')->draft['skills'][0]['items'][0]['imagePath']);

        foreach (['//example.com/icon.svg', 'https://example.com/icon.svg', '/../../icon.svg', 'data:image/svg+xml,<svg/>', '/icon.svg?script=1', '/icon.html'] as $path) {
            $data['skills'][0]['items'][0]['imagePath'] = $path;
            $this->putJson('/dashboard/pages/about', ['version' => 1, 'data' => $data])
                ->assertUnprocessable()->assertJsonValidationErrors('data.skills.0.items.0.imagePath');
        }
    }

    public function test_unpublished_projects_are_absent_from_public_pages_api_and_sitemap(): void
    {
        $project = $this->project(['is_published' => false]);
        $this->get('/work/'.$project->mongo_id)->assertNotFound();
        $this->getJson('/api/projects/'.$project->mongo_id)->assertNotFound();
        $this->getJson('/api/projects')->assertJsonCount(0);
        $this->get('/sitemap.xml')->assertDontSee($project->mongo_id);
        $this->actingAs($this->admin())->get('/work/'.$project->mongo_id.'?preview=1')->assertOk()->assertInertia(fn (Assert $page) => $page->where('seo.robots', 'noindex, nofollow'));
        $this->get('/dashboard')->assertInertia(fn (Assert $page) => $page->has('projects', 1)->where('stats.drafts', 1)->has('daily', 30));
    }

    public function test_inbox_status_notes_filter_and_deletion_are_private(): void
    {
        $message = ContactMessage::create(['name' => 'Enquiry sender', 'email' => 'sender@example.com', 'message' => 'I would like to discuss a project.']);
        $this->actingAs($this->admin())->patch('/dashboard/inbox/'.$message->id, ['status' => 'read', 'notes' => 'Follow up tomorrow'])->assertSessionHasNoErrors();
        $this->assertSame('read', $message->fresh()->status);
        $this->get('/dashboard/inbox?status=read&q=sender')->assertInertia(fn (Assert $page) => $page->has('messages.data', 1)->where('messages.data.0.notes', 'Follow up tomorrow'));
        $this->get('/dashboard/inbox?status=new')->assertInertia(fn (Assert $page) => $page->has('messages.data', 0));
        $this->delete('/dashboard/inbox/'.$message->id)->assertRedirect();
        $this->assertDatabaseCount('contact_messages', 0);
    }

    public function test_asset_uploads_and_media_labels_are_saved_safely(): void
    {
        $this->actingAs($this->admin());
        $this->postJson('/dashboard/assets/cv', ['file' => UploadedFile::fake()->image('not-a-cv.png')])->assertUnprocessable();
        $this->postJson('/dashboard/assets/cv', ['file' => UploadedFile::fake()->createWithContent('cv.pdf', "%PDF-1.4\n%%EOF")])->assertCreated();
        $this->postJson('/dashboard/assets/portrait', ['file' => UploadedFile::fake()->image('portrait.png', 100, 120)])->assertCreated();
        $this->get('/about')->assertInertia(fn (Assert $page) => $page->where('cms.assets.cv', fn ($url) => str_contains($url, '/storage/'))->where('cms.assets.portrait', fn ($url) => str_contains($url, 'display')));
        $project = $this->project();
        $media = $project->addMedia(UploadedFile::fake()->image('one.png', 60, 60))->toMediaCollection('images');
        $other = $this->project();
        $this->patchJson('/dashboard/projects/'.$other->mongo_id.'/media/'.$media->id, ['alt' => 'Description'])->assertNotFound();
        $this->patchJson('/dashboard/projects/'.$project->mongo_id.'/media/'.$media->id, ['alt' => 'Accessible description'])->assertOk();
        $this->assertSame('Accessible description', $media->fresh()->getCustomProperty('alt'));
        $second = $project->addMedia(UploadedFile::fake()->image('two.png', 60, 60))->toMediaCollection('images');
        $this->postJson('/dashboard/projects/'.$project->mongo_id.'/media/'.$second->id.'/cover')->assertOk();
        $this->assertSame($second->id, $project->fresh()->getFirstMedia('images')->id);
    }

    public function test_password_change_requires_current_password_and_revokes_login(): void
    {
        $admin = User::factory()->create(['is_admin' => true, 'password' => 'OldPassword!42']);
        $this->actingAs($admin);
        $data = ['current_password' => 'incorrect', 'password' => 'NewSecurePassword!42', 'password_confirmation' => 'NewSecurePassword!42'];
        $this->putJson('/dashboard/account', $data)->assertUnprocessable()->assertJsonValidationErrors('current_password');
        $this->put('/dashboard/account', [...$data, 'current_password' => 'OldPassword!42'])->assertRedirect('/login');
        $this->assertGuest();
        $this->assertTrue(Hash::check('NewSecurePassword!42', $admin->fresh()->password));
    }
}
