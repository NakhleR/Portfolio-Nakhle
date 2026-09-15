<?php

namespace App\Console\Commands;

use App\Models\AnalyticsConsent;
use App\Models\AnalyticsEvent;
use Illuminate\Console\Command;

class PruneAnalytics extends Command
{
    protected $signature = 'analytics:prune';

    protected $description = 'Delete analytics events older than 90 days and expired consent records';

    public function handle(): int
    {
        $events = AnalyticsEvent::where('created_at', '<', now()->subDays(90))->delete();
        $consents = AnalyticsConsent::where('expires_at', '<=', now())->delete();
        $this->info("Deleted {$events} events and {$consents} expired consent records.");

        return self::SUCCESS;
    }
}
