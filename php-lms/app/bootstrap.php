<?php

declare(strict_types=1);

use PhpLms\Core\Auth;
use PhpLms\Core\SecureMySQL;

require __DIR__ . '/helpers.php';

spl_autoload_register(static function (string $class): void {
    $prefix = 'PhpLms\\';

    if (!str_starts_with($class, $prefix)) {
        return;
    }

    $relative = substr($class, strlen($prefix));
    $file = __DIR__ . '/' . str_replace('\\', '/', $relative) . '.php';

    if (is_file($file)) {
        require $file;
    }
});

$envFile = dirname(__DIR__) . '/.env';
if (is_file($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];

    foreach ($lines as $line) {
        $line = trim($line);

        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }

        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);

        if (
            (str_starts_with($value, '"') && str_ends_with($value, '"')) ||
            (str_starts_with($value, "'") && str_ends_with($value, "'"))
        ) {
            $value = substr($value, 1, -1);
        }

        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
        putenv($key . '=' . $value);
    }
}

$sessionName = app_config('app.session_name', 'apoorwa_php_lms');
session_name((string) $sessionName);
session_set_cookie_params([
    'httponly' => true,
    'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
    'samesite' => 'Lax',
    'path' => '/',
]);
session_start();

date_default_timezone_set('Asia/Colombo');

$db = new SecureMySQL((array) app_config('db'));
$auth = new Auth($db);

set_exception_handler(static function (Throwable $exception): void {
    http_response_code(500);

    if (app_config('app.debug', false)) {
        echo '<pre>' . app_h($exception->getMessage() . "\n\n" . $exception->getTraceAsString()) . '</pre>';
        return;
    }

    echo '<h1>Application Error</h1><p>Something went wrong while processing your request.</p>';
});

