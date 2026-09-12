<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command?->info('Use portfolio:import with the private snapshot to restore the original portfolio. No sample users or content are created.');
    }
}
