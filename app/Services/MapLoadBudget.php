<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Throwable;

class MapLoadBudget
{
    public function reserveKey(): ?string
    {
        $key = (string) config('services.google_maps.key');
        $limit = max(0, min(9000, (int) config('services.google_maps.monthly_limit')));
        if ($key === '' || $limit === 0) {
            return null;
        }

        try {
            return DB::transaction(function () use ($key, $limit): ?string {
                $month = now('America/Los_Angeles')->format('Y-m');
                DB::table('map_load_budgets')->insertOrIgnore(['month' => $month, 'reserved_loads' => 0]);
                $budget = DB::table('map_load_budgets')->where('month', $month)->lockForUpdate()->first();
                if ($budget === null || $budget->reserved_loads >= $limit) {
                    return null;
                }
                DB::table('map_load_budgets')->where('month', $month)->increment('reserved_loads');

                return $key;
            }, 3);
        } catch (Throwable $exception) {
            report($exception);

            return null;
        }
    }
}
