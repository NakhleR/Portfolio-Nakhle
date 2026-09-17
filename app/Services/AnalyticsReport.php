<?php

namespace App\Services;

use App\Models\AnalyticsEvent;
use App\Models\Project;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AnalyticsReport
{
    public function build(array $filters): array
    {
        $days = (int) ($filters['days'] ?? 30);
        $end = now();
        $start = $end->copy()->subDays($days - 1)->startOfDay();
        $retained = $end->copy()->subDays(89)->startOfDay();
        $window = AnalyticsEvent::whereBetween('created_at', [$start, $end]);
        $paths = (clone $window)->distinct()->orderBy('path')->pluck('path');
        $base = $this->filter($window, $filters);
        $views = (clone $base)->where('type', 'page_view');
        $reading = (clone $base)->where('type', 'reading');
        $clicks = (clone $base)->where('type', 'click');
        $summary = $this->summary($base);
        $previous = $days <= 30 ? $this->filter(AnalyticsEvent::where('created_at', '>=', $start->copy()->subDays($days))->where('created_at', '<', $start), $filters) : null;
        $daily = $this->daily($base);
        $previousDaily = $previous ? $this->daily($previous) : collect();
        $qualified = (clone $base)->whereIn('view_id', (clone $views)->select('view_id'))->select('view_id')->groupBy('view_id')->havingRaw("SUM(CASE WHEN type = 'reading' THEN value ELSE 0 END) >= 10 OR MAX(CASE WHEN type = 'scroll' THEN value ELSE 0 END) >= 50 OR SUM(CASE WHEN type = 'click' AND target != 'surface' THEN 1 ELSE 0 END) > 0");
        $engaged = DB::query()->fromSub($qualified, 'qualified_views')->count();
        $returning = (clone $views)->whereIn('consent_id', AnalyticsEvent::where('type', 'page_view')->whereBetween('created_at', [$retained, $start->copy()->subSecond()])->select('consent_id'))->distinct()->count('consent_id');
        $pageReading = (clone $reading)->selectRaw('path, SUM(value) as seconds')->groupBy('path')->pluck('seconds', 'path');
        $pageClicks = (clone $clicks)->selectRaw('path, COUNT(*) as clicks')->groupBy('path')->pluck('clicks', 'path');
        $pageDepth = (clone $base)->where('type', 'scroll')->where('value', '>=', 75)->whereIn('view_id', (clone $views)->select('view_id'))->selectRaw('path, COUNT(DISTINCT view_id) as reached')->groupBy('path')->pluck('reached', 'path');
        $hour = DB::connection()->getDriverName() === 'sqlite' ? "CAST(strftime('%H', created_at) AS INTEGER)" : 'HOUR(created_at)';
        $weekday = DB::connection()->getDriverName() === 'sqlite' ? "((CAST(strftime('%w', created_at) AS INTEGER) + 6) % 7)" : 'WEEKDAY(created_at)';
        $intentTargets = ['project', 'cv-download', 'email', 'telephone', 'external-link'];
        $intent = (clone $clicks)->whereIn('target', $intentTargets)->whereIn('session_id', (clone $views)->select('session_id'))->selectRaw('target, COUNT(*) as clicks, COUNT(DISTINCT session_id) as sessions')->groupBy('target')->get()->keyBy('target');

        return [
            'filters' => ['days' => $days, 'path' => $filters['path'] ?? '', 'device' => $filters['device'] ?? ''],
            'paths' => $paths,
            'pageLabels' => Project::pluck('title', 'mongo_id')->mapWithKeys(fn ($title, $id) => ['/work/'.$id => $title])->all() + ['/' => 'Home', '/about' => 'About', '/work' => 'Work archive', '/contact' => 'Contact', '/privacy' => 'Privacy', '/cookies' => 'Cookies', '/terms' => 'Terms', '/legal' => 'Legal'],
            'period' => ['start' => $start->toDateString(), 'end' => $end->toDateString(), 'timezone' => config('app.timezone'), 'previousStart' => $previous ? $start->copy()->subDays($days)->toDateString() : null, 'previousEnd' => $previous ? $start->copy()->subDay()->toDateString() : null],
            'summary' => $summary,
            'previous' => $previous ? $this->summary($previous) : null,
            'engagement' => ['engagedViews' => $engaged, 'rate' => $summary['views'] ? round($engaged / $summary['views'] * 100, 1) : 0, 'returning' => $returning, 'new' => max(0, $summary['visitors'] - $returning), 'pagesPerSession' => $summary['sessions'] ? round($summary['views'] / $summary['sessions'], 2) : 0],
            'daily' => collect(range(0, $days - 1))->map(function ($offset) use ($start, $days, $daily, $previousDaily, $previous) {
                $day = $start->copy()->addDays($offset)->toDateString();
                $priorDay = $start->copy()->subDays($days)->addDays($offset)->toDateString();

                return ['day' => $day, ...($daily[$day] ?? ['views' => 0, 'sessions' => 0, 'reading' => 0, 'clicks' => 0]), 'previous' => $previous ? ($previousDaily[$priorDay] ?? ['views' => 0, 'sessions' => 0, 'reading' => 0, 'clicks' => 0]) : null];
            }),
            'devices' => (clone $views)->selectRaw('device, COUNT(DISTINCT view_id) as views')->groupBy('device')->get(),
            'countries' => $this->countries($views),
            'activity' => (clone $views)->selectRaw("$weekday as weekday, $hour as hour, COUNT(DISTINCT view_id) as views")->groupByRaw("$weekday, $hour")->get(),
            'intents' => collect($intentTargets)->map(fn ($target) => ['target' => $target, 'clicks' => (int) ($intent[$target]->clicks ?? 0), 'sessions' => (int) ($intent[$target]->sessions ?? 0)]),
            'pages' => (clone $views)->selectRaw('path, COUNT(DISTINCT view_id) as views, COUNT(DISTINCT session_id) as sessions')->groupBy('path')->orderByDesc('views')->limit(50)->get()->map(fn ($row) => ['path' => $row->path, 'views' => (int) $row->views, 'sessions' => (int) $row->sessions, 'seconds' => (int) ($pageReading[$row->path] ?? 0), 'clicks' => (int) ($pageClicks[$row->path] ?? 0), 'deepViews' => (int) ($pageDepth[$row->path] ?? 0)]),
            'sections' => (clone $reading)->selectRaw('path, section, SUM(value) as seconds, COUNT(DISTINCT view_id) as readers')->groupBy('path', 'section')->orderByDesc('seconds')->limit(50)->get(),
            'actions' => (clone $clicks)->selectRaw('path, section, target, COUNT(*) as clicks')->groupBy('path', 'section', 'target')->orderByDesc('clicks')->limit(50)->get(),
            'depth' => (clone $base)->where('type', 'scroll')->whereIn('view_id', (clone $views)->select('view_id'))->selectRaw('value as depth, COUNT(DISTINCT view_id) as views')->groupBy('value')->orderBy('value')->get(),
            'heatmap' => ! empty($filters['path']) && ! empty($filters['device']) ? (clone $clicks)->whereNotNull('x')->whereNotNull('y')->selectRaw('x, y, COUNT(*) as clicks')->groupBy('x', 'y')->orderByDesc('clicks')->limit(1000)->get() : [],
        ];
    }

    private function countries(Builder $views): Collection
    {
        $sessions = (clone $views)->selectRaw('session_id, country, ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY CASE WHEN country IS NULL THEN 1 ELSE 0 END, created_at, id) as country_rank');

        return DB::query()->fromSub($sessions, 'session_countries')->where('country_rank', 1)
            ->selectRaw('country, COUNT(*) as sessions')->groupBy('country')->orderByDesc('sessions')->orderBy('country')
            ->get()->map(fn ($row) => ['country' => $row->country, 'sessions' => (int) $row->sessions]);
    }

    private function filter(Builder $query, array $filters): Builder
    {
        return $query->when(! empty($filters['path']), fn ($query) => $query->where('path', $filters['path']))->when(! empty($filters['device']), fn ($query) => $query->where('device', $filters['device']));
    }

    private function summary(Builder $query): array
    {
        $row = (clone $query)->selectRaw("COUNT(DISTINCT CASE WHEN type = 'page_view' THEN view_id END) as views, COUNT(DISTINCT CASE WHEN type = 'page_view' THEN session_id END) as sessions, COUNT(DISTINCT CASE WHEN type = 'page_view' THEN consent_id END) as visitors, COALESCE(SUM(CASE WHEN type = 'reading' THEN value ELSE 0 END), 0) as reading, SUM(CASE WHEN type = 'click' THEN 1 ELSE 0 END) as clicks")->first();

        return collect(['views', 'sessions', 'visitors', 'reading', 'clicks'])->mapWithKeys(fn ($key) => [$key => (int) $row->{$key}])->all();
    }

    private function daily(Builder $query): Collection
    {
        return (clone $query)->selectRaw("DATE(created_at) as day, COUNT(DISTINCT CASE WHEN type = 'page_view' THEN view_id END) as views, COUNT(DISTINCT CASE WHEN type = 'page_view' THEN session_id END) as sessions, COALESCE(SUM(CASE WHEN type = 'reading' THEN value ELSE 0 END), 0) as reading, SUM(CASE WHEN type = 'click' THEN 1 ELSE 0 END) as clicks")->groupByRaw('DATE(created_at)')->get()->mapWithKeys(fn ($row) => [$row->day => ['views' => (int) $row->views, 'sessions' => (int) $row->sessions, 'reading' => (int) $row->reading, 'clicks' => (int) $row->clicks]]);
    }
}
