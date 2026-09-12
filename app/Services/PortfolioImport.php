<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Timeline;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class PortfolioImport
{
    public const PROJECT_FIELDS = ['title', 'category', 'description', 'longDescription', 'technologies', 'liveUrl', 'githubUrl', 'order'];

    public const TIMELINE_FIELDS = ['year', 'title', 'location', 'category', 'description', 'bullets', 'order'];

    public function read(string $snapshotPath, string $directory): array
    {
        $snapshot = json_decode(file_get_contents($snapshotPath), true, 512, JSON_THROW_ON_ERROR);
        $collections = $snapshot['collections'] ?? throw new RuntimeException('Invalid snapshot.');
        if (array_diff(array_keys($collections), ['projects', 'timelines', 'users'])) {
            throw new RuntimeException('Unexpected collections. Review and map these before importing.');
        }
        foreach (['projects', 'timelines', 'users'] as $name) {
            if (! isset($collections[$name]) || ! is_array($collections[$name])) {
                throw new RuntimeException('Missing collection: '.$name);
            }
            $ids = [];
            foreach ($collections[$name] as $row) {
                if (! preg_match('/^[a-f0-9]{24}$/', $row['_id'] ?? '') || isset($ids[$row['_id']])) {
                    throw new RuntimeException('Missing or duplicate source ID.');
                }
                $ids[$row['_id']] = true;
            }
        }
        $manifest = json_decode(file_get_contents($directory.'/manifest.json'), true, 512, JSON_THROW_ON_ERROR);
        foreach ($collections['projects'] as $row) {
            foreach ($row['images'] ?? [] as $url) {
                $entry = $manifest[$url] ?? throw new RuntimeException('Missing image manifest entry.');
                $file = $directory.'/'.basename($entry['file']);
                if (! is_file($file) || hash_file('sha256', $file) !== $entry['sha256']) {
                    throw new RuntimeException('Missing or corrupt image: '.basename($file));
                }
            }
        }

        return [$collections, $manifest];
    }

    public function import(array $collections, array $manifest, string $directory): void
    {
        $createdMedia = [];
        try {
            DB::transaction(function () use ($collections, $manifest, $directory, &$createdMedia): void {
                foreach (['projects' => Project::class, 'timelines' => Timeline::class] as $collection => $class) {
                    $fields = $collection === 'projects' ? self::PROJECT_FIELDS : self::TIMELINE_FIELDS;
                    foreach ($collections[$collection] as $row) {
                        $model = $class::firstOrNew(['mongo_id' => $row['_id']]);
                        $model->fill(array_intersect_key($row, array_flip($fields)));
                        $model->legacy_document = $row;
                        $model->created_at = Carbon::parse($row['createdAt']);
                        $model->updated_at = Carbon::parse($row['updatedAt']);
                        $model->timestamps = false;
                        $model->save();
                        if ($model instanceof Project) {
                            foreach ($row['images'] ?? [] as $index => $url) {
                                $media = $model->getMedia('images')->first(fn ($item) => $item->getCustomProperty('source_index') === $index && $item->getCustomProperty('source_url') === $url);
                                if (! $media) {
                                    $entry = $manifest[$url];
                                    $media = $model->addMedia($directory.'/'.basename($entry['file']))->preservingOriginal()
                                        ->withCustomProperties(['source_url' => $url, 'source_index' => $index, 'sha256' => $entry['sha256']])
                                        ->toMediaCollection('images');
                                    $createdMedia[] = $media;
                                }
                                $media->order_column = $index + 1;
                                $media->save();
                                $model->unsetRelation('media');
                            }
                        }
                    }
                }
                foreach ($collections['users'] as $row) {
                    $user = User::firstOrNew(['mongo_id' => $row['_id']]);
                    if (User::where('email', $row['email'])->where(fn ($query) => $query->whereNull('mongo_id')->orWhere('mongo_id', '!=', $row['_id']))->exists()) {
                        throw new RuntimeException('Conflicting user email. Import cancelled.');
                    }
                    $user->fill(['email' => $row['email'], 'name' => $row['name'] ?? explode('@', $row['email'])[0],
                        'is_admin' => $row['isAdmin'] ?? false, 'legacy_document' => $row]);
                    $user->created_at = Carbon::parse($row['createdAt']);
                    $user->updated_at = Carbon::parse($row['updatedAt']);
                    $user->timestamps = false;
                    // Copy the bcrypt hash without passing it through the hashed cast.
                    $user->setRawAttributes([...$user->getAttributes(), 'password' => $row['password']]);
                    $user->save();
                }
                $this->verify($collections, $manifest);
            });
        } catch (Throwable $error) {
            foreach ($createdMedia as $media) {
                Storage::disk($media->disk)->deleteDirectory((string) $media->id);
            }
            throw $error;
        }
    }

    public function verify(array $collections, array $manifest): array
    {
        $report = ['projects' => 0, 'timelines' => 0, 'users' => 0, 'images' => 0];
        foreach (['projects' => Project::class, 'timelines' => Timeline::class, 'users' => User::class] as $collection => $class) {
            foreach ($collections[$collection] as $row) {
                $model = $class::where('mongo_id', $row['_id'])->firstOrFail();
                if (! $this->equal($model->legacy_document, $row)) {
                    throw new RuntimeException('Original document mismatch: '.$row['_id']);
                }
                $fields = match ($collection) {
                    'projects' => self::PROJECT_FIELDS,'timelines' => self::TIMELINE_FIELDS,default => ['email']
                };
                foreach ($fields as $field) {
                    if (array_key_exists($field, $row) && ! $this->equal($model->$field, $row[$field])) {
                        throw new RuntimeException('Field mismatch: '.$row['_id'].'.'.$field);
                    }
                }
                foreach (['createdAt' => 'created_at', 'updatedAt' => 'updated_at'] as $source => $target) {
                    if (! Carbon::parse($row[$source])->equalTo($model->$target)) {
                        throw new RuntimeException('Timestamp mismatch: '.$row['_id'].'.'.$source);
                    }
                }
                if ($model instanceof User && ($model->getRawOriginal('password') !== $row['password'] || $model->is_admin !== (bool) $row['isAdmin'])) {
                    throw new RuntimeException('User credentials/role mismatch.');
                }
                if ($model instanceof Project) {
                    $media = $model->getMedia('images');
                    if ($media->count() !== count($row['images'] ?? [])) {
                        throw new RuntimeException('Image count mismatch.');
                    }
                    foreach (($row['images'] ?? []) as $index => $url) {
                        $item = $media[$index];
                        if ($item->getCustomProperty('source_url') !== $url || ! is_file($item->getPath()) || hash_file('sha256', $item->getPath()) !== $manifest[$url]['sha256']) {
                            throw new RuntimeException('Image order/content mismatch.');
                        }
                        $report['images']++;
                    }
                }
                $report[$collection]++;
            }
        }

        return $report;
    }

    private function equal(mixed $a, mixed $b): bool
    {
        if (is_numeric($a) && is_numeric($b) && ! is_string($a) && ! is_string($b)) {
            return (float) $a === (float) $b;
        }
        if (! is_array($a) || ! is_array($b)) {
            return $a === $b;
        }
        if (array_is_list($a) !== array_is_list($b) || count($a) !== count($b)) {
            return false;
        }
        foreach ($a as $key => $value) {
            if (! array_key_exists($key, $b) || ! $this->equal($value, $b[$key])) {
                return false;
            }
        }

        return true;
    }
}
