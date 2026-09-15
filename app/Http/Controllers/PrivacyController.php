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
        $publishedAt = CmsDocument::whereIn('key', [$request->route()->getName(), 'legal'])->max('published_at');
        $updated = $publishedAt ? Carbon::parse($publishedAt)->format('j F Y') : config('privacy.updated');

        return Inertia::render('Legal', ['document' => $request->route()->getName(), 'legal' => [...config('privacy'), ...app(CmsContent::class)->all($request)['legal'], 'updated' => $updated]]);
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
