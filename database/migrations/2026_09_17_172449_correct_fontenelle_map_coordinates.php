<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function (): void {
            $document = DB::table('cms_documents')->where('key', 'site')->lockForUpdate()->first();
            if ($document === null) {
                return;
            }

            $updates = [];
            foreach (['published', 'draft'] as $field) {
                $data = json_decode($document->{$field} ?? 'null', true, 512, JSON_THROW_ON_ERROR);
                if (! is_array($data) || (float) ($data['latitude'] ?? 0) !== 49.4431 || (float) ($data['longitude'] ?? 0) !== 1.0993) {
                    continue;
                }

                $data['latitude'] = 49.44303;
                $data['longitude'] = 1.08613;
                if (($data['map_label'] ?? 'Rouen, France') === 'Rouen, France') {
                    $data['map_label'] = 'Rue de Fontenelle, 76000 Rouen';
                }
                $updates[$field] = json_encode($data, JSON_THROW_ON_ERROR);
            }

            if ($updates !== []) {
                DB::table('cms_documents')->where('key', 'site')->update([
                    ...$updates,
                    'version' => $document->version + 1,
                    'updated_at' => now(),
                ]);
            }
        });
    }

    /**
     * Keep the corrected location on rollback rather than restoring an inaccurate pin.
     */
    public function down(): void {}
};
