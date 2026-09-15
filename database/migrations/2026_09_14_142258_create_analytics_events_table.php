<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analytics_events', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('consent_id')->constrained('analytics_consents')->cascadeOnDelete();
            $table->uuid('session_id')->index();
            $table->uuid('view_id')->index();
            $table->string('path', 160);
            $table->string('type', 20);
            $table->string('device', 10);
            $table->string('section', 60)->nullable();
            $table->string('target', 60)->nullable();
            $table->unsignedSmallInteger('value')->default(0);
            $table->unsignedTinyInteger('x')->nullable();
            $table->unsignedTinyInteger('y')->nullable();
            $table->timestamp('created_at')->index();
            $table->index(['path', 'type', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_events');
    }
};
