<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AnalyticsConsent extends Model
{
    public const VERSION = '2026-09-14';

    public const COOKIE = 'portfolio_consent';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];

    protected function casts(): array
    {
        return ['analytics' => 'boolean', 'expires_at' => 'datetime'];
    }

    public static function current(Request $request): ?self
    {
        $id = $request->cookie(self::COOKIE);
        if (! is_string($id) || ! Str::isUuid($id)) {
            return null;
        }

        return self::whereKey($id)->where('version', self::VERSION)->where('expires_at', '>', now())->first();
    }
}
