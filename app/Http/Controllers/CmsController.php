<?php

namespace App\Http\Controllers;

use App\Http\Requests\CmsRequest;
use App\Models\CmsDocument;
use App\Models\CmsRevision;
use App\Services\CmsContent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CmsController extends Controller
{
    public function edit(string $section, CmsContent $cms): Response
    {
        $defaults = $cms->defaults($section);
        $document = CmsDocument::find($section);

        return Inertia::render('CmsEditor', ['section' => $section, 'definition' => config('cms.'.$section), 'data' => $document?->draft ?? $document?->published ?? $defaults, 'version' => $document?->version ?? 0, 'publishedAt' => $document?->published_at?->toIso8601String(), 'hasDraft' => $document?->draft !== null, 'revisions' => CmsRevision::where('document_key', $section)->latest('id')->limit(20)->get(['id', 'created_at'])]);
    }

    private function document(string $section, int $version): CmsDocument
    {
        abort_unless(config('cms.'.$section), 404);
        CmsDocument::firstOrCreate(['key' => $section]);
        $document = CmsDocument::whereKey($section)->lockForUpdate()->firstOrFail();
        if ($document->version !== $version) {
            throw ValidationException::withMessages(['version' => 'This content changed in another tab. Reload before saving.']);
        }

        return $document;
    }

    public function save(CmsRequest $request, string $section): RedirectResponse
    {
        DB::transaction(function () use ($request, $section): void {
            $document = $this->document($section, $request->integer('version'));
            $document->update(['draft' => $request->validated('data'), 'version' => $document->version + 1]);
        });

        return back()->with('success', 'Draft saved. The public site is unchanged.');
    }

    public function publish(Request $request, string $section, CmsContent $cms): RedirectResponse
    {
        $request->validate(['version' => ['required', 'integer', 'min:0']]);
        DB::transaction(function () use ($request, $section, $cms): void {
            $document = $this->document($section, $request->integer('version'));
            if (! $document->draft) {
                throw ValidationException::withMessages(['version' => 'Save a draft before publishing.']);
            }
            if (! $document->published) {
                CmsRevision::create(['document_key' => $section, 'data' => $cms->defaults($section), 'user_id' => $request->user()->id]);
            }
            CmsRevision::create(['document_key' => $section, 'data' => $document->draft, 'user_id' => $request->user()->id]);
            $document->update(['published' => $document->draft, 'draft' => null, 'version' => $document->version + 1, 'published_at' => now()]);
        });

        return back()->with('success', 'Published. The website now uses this content.');
    }

    public function restore(Request $request, string $section, CmsRevision $revision): RedirectResponse
    {
        $request->validate(['version' => ['required', 'integer', 'min:0']]);
        abort_unless($revision->document_key === $section, 404);
        DB::transaction(function () use ($request, $section, $revision): void {
            $document = $this->document($section, $request->integer('version'));
            $document->update(['draft' => $revision->data, 'version' => $document->version + 1]);
        });

        return back()->with('success', 'Revision restored as a draft. Preview it before publishing.');
    }
}
