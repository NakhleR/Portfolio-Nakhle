<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cms_documents', function (Blueprint $table): void {
            $table->string('key', 40)->primary();
            $table->json('draft')->nullable();
            $table->json('published')->nullable();
            $table->unsignedInteger('version')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
        Schema::create('cms_revisions', function (Blueprint $table): void {
            $table->id();
            $table->string('document_key', 40);
            $table->json('data');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
            $table->index(['document_key', 'created_at']);
        });
        Schema::create('site_assets', function (Blueprint $table): void {
            $table->id();
            $table->string('slot')->unique();
            $table->timestamps();
        });
        Schema::table('projects', function (Blueprint $table): void {
            $table->boolean('is_published')->default(true)->index();
        });
        Schema::table('contact_messages', function (Blueprint $table): void {
            $table->string('status', 20)->default('new')->index();
            $table->text('notes')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('contact_messages', fn (Blueprint $table) => $table->dropColumn(['status', 'notes']));
        Schema::table('projects', fn (Blueprint $table) => $table->dropColumn('is_published'));
        Schema::dropIfExists('cms_revisions');
        Schema::dropIfExists('cms_documents');
        Schema::dropIfExists('site_assets');
    }
};
