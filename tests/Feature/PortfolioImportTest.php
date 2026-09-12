<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use App\Services\PortfolioImport;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PortfolioImportTest extends TestCase
{
    use RefreshDatabase;

    private string $directory;

    private array $snapshot;

    private array $manifest;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->directory = storage_path('framework/testing/import-'.bin2hex(random_bytes(8)));
        File::makeDirectory($this->directory, 0755, true);
        $file = UploadedFile::fake()->image('original.png', 20, 30);
        File::copy($file->getPathname(), $this->directory.'/original.png');
        $url = 'https://res.cloudinary.com/example/image/upload/original.png';
        $date = '2025-04-23T22:32:50.937Z';
        $this->snapshot = ['database' => 'fixture', 'collections' => [
            'projects' => [['_id' => str_repeat('a', 24), 'title' => 'Exact é 😀', 'category' => 'Web', 'description' => "Keep\nnewlines  and  spacing", 'longDescription' => '', 'technologies' => ['Vue', 'C++', 'Vue'], 'images' => [$url, $url], 'liveUrl' => '', 'githubUrl' => '', 'order' => 0.5, 'createdAt' => $date, 'updatedAt' => $date, '__v' => 4]],
            'timelines' => [['_id' => str_repeat('b', 24), 'year' => '2025 – Present', 'title' => 'Experience', 'category' => 'work', 'location' => '', 'description' => 'Text', 'bullets' => ['First', 'Second'], 'order' => -2, 'createdAt' => $date, 'updatedAt' => $date, '__v' => 1]],
            'users' => [['_id' => str_repeat('c', 24), 'email' => 'admin@example.com', 'password' => '$2a$'.substr(Hash::make('original-password'), 4), 'isAdmin' => true, 'createdAt' => $date, 'updatedAt' => $date, '__v' => 0]],
        ]];
        $this->manifest = [$url => ['file' => 'original.png', 'sha256' => hash_file('sha256', $this->directory.'/original.png'), 'bytes' => filesize($this->directory.'/original.png')]];
        File::put($this->directory.'/snapshot.json', json_encode($this->snapshot));
        File::put($this->directory.'/manifest.json', json_encode($this->manifest));
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->directory);
        parent::tearDown();
    }

    public function test_import_preserves_all_fields_hashes_milliseconds_media_and_is_repeatable(): void
    {
        foreach ([false, false, true] as $verifyOnly) {
            $options = ['snapshot' => $this->directory.'/snapshot.json', '--media-dir' => $this->directory];
            if ($verifyOnly) {
                $options['--verify-only'] = true;
            }
            $this->artisan('portfolio:import', $options)->assertSuccessful();
        }
        $this->assertDatabaseCount('projects', 1);
        $this->assertDatabaseCount('timelines', 1);
        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseCount('media', 2);
        $project = Project::first();
        $this->assertSame('Exact é 😀', $project->title);
        $this->assertSame('937', $project->created_at->format('v'));
        $this->assertSame($this->snapshot['collections']['users'][0]['password'], User::first()->getRawOriginal('password'));
        $this->assertTrue(Hash::check('original-password', User::first()->password));
        $this->assertFileExists($this->directory.'/original.png');
    }

    public function test_missing_media_fails_before_writing_records(): void
    {
        File::delete($this->directory.'/original.png');
        $this->artisan('portfolio:import', ['snapshot' => $this->directory.'/snapshot.json', '--media-dir' => $this->directory])->assertFailed();
        $this->assertDatabaseCount('projects', 0);
        $this->assertDatabaseCount('users', 0);
    }

    public function test_verification_detects_changed_fields_and_does_not_rewrite_them(): void
    {
        $importer = app(PortfolioImport::class);
        [$data,$manifest] = $importer->read($this->directory.'/snapshot.json', $this->directory);
        $importer->import($data, $manifest, $this->directory);
        Project::first()->update(['title' => 'Changed']);
        $this->artisan('portfolio:import', ['snapshot' => $this->directory.'/snapshot.json', '--media-dir' => $this->directory, '--verify-only' => true])->assertFailed();
        $this->assertSame('Changed', Project::first()->title);
    }

    public function test_unmapped_collections_are_rejected(): void
    {
        $this->snapshot['collections']['unknown'] = [];
        File::put($this->directory.'/snapshot.json', json_encode($this->snapshot));
        $this->artisan('portfolio:import', ['snapshot' => $this->directory.'/snapshot.json', '--media-dir' => $this->directory])->assertFailed();
        $this->assertDatabaseCount('projects', 0);
    }

    public function test_corrupt_download_is_rejected_before_import(): void
    {
        File::put($this->directory.'/original.png', 'corrupted');
        $this->artisan('portfolio:import', ['snapshot' => $this->directory.'/snapshot.json', '--media-dir' => $this->directory])->assertFailed();
        $this->assertDatabaseCount('projects', 0);
    }

    public function test_user_conflict_rolls_back_records_and_new_image_files(): void
    {
        User::factory()->create(['email' => 'admin@example.com']);
        $this->artisan('portfolio:import', ['snapshot' => $this->directory.'/snapshot.json', '--media-dir' => $this->directory])->assertFailed();
        $this->assertDatabaseCount('projects', 0);
        $this->assertDatabaseCount('timelines', 0);
        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseCount('media', 0);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }
}
