<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('map_load_budgets', function (Blueprint $table): void {
            $table->string('month', 7)->primary();
            $table->unsignedInteger('reserved_loads')->default(0);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('map_load_budgets');
    }
};
