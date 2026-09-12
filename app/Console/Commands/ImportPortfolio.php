<?php

namespace App\Console\Commands;

use App\Services\PortfolioImport;
use Illuminate\Console\Command;
use Throwable;

class ImportPortfolio extends Command
{
    protected $signature = 'portfolio:import {snapshot : Private JSON export} {--media-dir= : Directory containing downloaded images and manifest.json} {--verify-only : Compare the existing MySQL data and media without modifying them}';

    protected $description = 'Import and verify the original portfolio records and local media, preserving MongoDB IDs and credentials.';

    public function handle(PortfolioImport $importer): int
    {
        try {
            $directory = rtrim((string) $this->option('media-dir'), '/\\');
            [$collections,$manifest] = $importer->read($this->argument('snapshot'), $directory);
            if (! $this->option('verify-only')) {
                $importer->import($collections, $manifest, $directory);
            }
            $report = $importer->verify($collections, $manifest);
            $this->info(json_encode(['verified' => true, ...$report], JSON_PRETTY_PRINT));

            return self::SUCCESS;
        } catch (Throwable $error) {
            $this->error('Import/verification failed: '.$error->getMessage());

            return self::FAILURE;
        }
    }
}
