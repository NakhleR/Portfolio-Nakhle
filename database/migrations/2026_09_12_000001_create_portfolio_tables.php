<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('mongo_id', 36)->nullable()->unique();
            $table->boolean('is_admin')->default(false);
            $table->json('legacy_document')->nullable();
        });
        Schema::create('projects', function (Blueprint $table): void {
            $table->id();
            $table->string('mongo_id', 36)->unique();
            $table->text('title');
            $table->text('category');
            $table->longText('description');
            $table->longText('longDescription')->nullable();
            $table->json('technologies')->nullable();
            $table->text('liveUrl')->nullable();
            $table->text('githubUrl')->nullable();
            $table->double('order')->default(0)->index();
            $table->json('legacy_document')->nullable();
            $table->timestamps(3);
        });
        Schema::create('timelines', function (Blueprint $table): void {
            $table->id();
            $table->string('mongo_id', 36)->unique();
            $table->text('year');
            $table->text('title');
            $table->text('location')->nullable();
            $table->string('category');
            $table->longText('description')->nullable();
            $table->json('bullets')->nullable();
            $table->double('order')->default(0)->index();
            $table->json('legacy_document')->nullable();
            $table->timestamps(3);
        });
        Schema::create('contact_messages', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->text('message');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_messages');
        Schema::dropIfExists('timelines');
        Schema::dropIfExists('projects');
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn(['mongo_id', 'is_admin', 'legacy_document']));
    }
};
