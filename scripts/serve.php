<?php

$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');
if (preg_match('#(^|/)\\.(?!well-known(?:/|$))#', $path)
    || preg_match('#^/storage/.*\\.(php[0-9]*|phtml|phar|cgi|pl|py|sh|shtml)(\\.|/|$)#i', $path)) {
    http_response_code(404);

    return true;
}

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
chdir(dirname(__DIR__).'/public');

return require dirname(__DIR__).'/vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php';
