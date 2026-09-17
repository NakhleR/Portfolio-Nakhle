<?php

namespace App\Http\Controllers;

use App\Services\MapLoadBudget;
use Illuminate\Http\JsonResponse;

class MapAccessController extends Controller
{
    public function __invoke(MapLoadBudget $budget): JsonResponse
    {
        $key = $budget->reserveKey();

        return response()->json($key === null
            ? ['provider' => 'leaflet']
            : ['provider' => 'google', 'key' => $key])
            ->header('Cache-Control', 'private, no-store');
    }
}
