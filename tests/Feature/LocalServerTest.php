<?php

namespace Tests\Feature;

use Symfony\Component\Process\Process;
use Tests\TestCase;

class LocalServerTest extends TestCase
{
    public function test_local_server_delivers_original_asset_bytes(): void
    {
        $socket = stream_socket_server('tcp://127.0.0.1:0');
        $this->assertIsResource($socket);
        $address = stream_socket_get_name($socket, false);
        fclose($socket);
        $server = new Process([PHP_BINARY, '-S', $address, '-t', public_path(), base_path('scripts/serve.php')], base_path());
        $server->setTimeout(10);
        $server->start();

        try {
            $this->assertTrue($server->waitUntil(fn (string $type, string $output): bool => str_contains($output, 'Development Server')));
            $context = stream_context_create(['http' => ['timeout' => 5]]);

            foreach (['Nakhle_CV.pdf', 'nakhle.png', 'DNA.glb', 'thinker.glb', 'draco/draco_wasm_wrapper.js'] as $asset) {
                $body = file_get_contents('http://'.$address.'/'.$asset, false, $context);

                $this->assertIsString($body);
                $this->assertNotEmpty($body, $asset.' must not be an empty successful response');
                $this->assertSame(hash_file('sha256', public_path($asset)), hash('sha256', $body), $asset.' must be served unchanged');
            }
        } finally {
            $server->stop();
        }
    }
}
