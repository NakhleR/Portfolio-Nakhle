<?php

namespace App\Http\Controllers;

use App\Models\AnalyticsConsent;
use App\Models\AnalyticsEvent;
use App\Models\CmsDocument;
use App\Services\CmsContent;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PrivacyController extends Controller
{
    public function page(Request $request): Response
    {
        $document = str_replace('fr.', '', $request->route()->getName());
        $publishedAt = CmsDocument::whereIn('key', [$document, 'fr_'.$document, 'legal'])->max('published_at');
        $updated = Carbon::parse(config('privacy.updated'));
        if ($publishedAt && Carbon::parse($publishedAt)->greaterThan($updated)) {
            $updated = Carbon::parse($publishedAt);
        }

        return Inertia::render('Legal', ['document' => $document, 'legal' => [...config('privacy'), ...app(CmsContent::class)->all($request)['legal'], 'website' => rtrim(config('app.canonical_url'), '/'), 'updated' => $updated->locale(app()->getLocale())->translatedFormat('j F Y')]]);
    }

    public function consent(Request $request): JsonResponse
    {
        $data = $request->validate(['analytics' => ['required', 'boolean']]);
        $allowed = $data['analytics'] && $request->header('Sec-GPC') !== '1' && $request->header('DNT') !== '1';
        $consent = AnalyticsConsent::current($request) ?? new AnalyticsConsent(['id' => (string) Str::uuid()]);
        $consent->fill(['analytics' => $allowed, 'version' => AnalyticsConsent::VERSION, 'expires_at' => now()->addDays(180)])->save();

        return response()->json(['analytics' => (bool) $allowed])->cookie(AnalyticsConsent::COOKIE, $consent->id, 180 * 24 * 60, '/', null, $request->isSecure(), true, false, 'lax');
    }

    public function erase(Request $request): JsonResponse
    {
        if ($consent = AnalyticsConsent::current($request)) {
            AnalyticsEvent::where('consent_id', $consent->id)->delete();
            $consent->update(['analytics' => false]);
        }

        return response()->json(['analytics' => false]);
    }
}
