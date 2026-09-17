<?php

namespace App\Http\Controllers;

use App\Http\Requests\AnalyticsEventRequest;
use App\Models\AnalyticsConsent;
use App\Models\AnalyticsEvent;
use App\Services\AnalyticsReport;
use App\Services\VisitorCountry;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AnalyticsController extends Controller
{
    public function store(AnalyticsEventRequest $request, VisitorCountry $countries): Response
    {
        $consent = AnalyticsConsent::current($request);
        $country = $countries->resolve($request);
        $rows = [];
        foreach ($request->validated('events') as $event) {
            $type = $event['type'];
            $rows[] = [
                'id' => $event['id'], 'consent_id' => $consent->id, 'session_id' => $event['session_id'], 'view_id' => $event['view_id'],
                'path' => $event['path'], 'type' => $type, 'device' => $event['device'],
                'country' => $type === 'page_view' ? $country : null,
                'section' => $event['section'] ?? null, 'target' => $type === 'click' ? ($event['target'] ?? 'button') : null,
                'value' => $type === 'reading' ? min(15, $event['value'] ?? 0) : ($type === 'scroll' ? ($event['value'] ?? 0) : 0),
                'x' => $type === 'click' ? ($event['x'] ?? null) : null, 'y' => $type === 'click' ? ($event['y'] ?? null) : null, 'created_at' => now(),
            ];
        }
        AnalyticsEvent::insertOrIgnore($rows);

        return response()->noContent();
    }

    public function index(Request $request, AnalyticsReport $report): InertiaResponse
    {
        $filters = $request->validate(['days' => ['sometimes', 'integer', 'in:7,30,90'], 'path' => ['nullable', 'string', 'max:160'], 'device' => ['nullable', 'in:mobile,tablet,desktop']]);

        return Inertia::render('Analytics', $report->build($filters));
    }
}
