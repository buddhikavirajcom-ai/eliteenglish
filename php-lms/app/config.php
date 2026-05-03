<?php

declare(strict_types=1);

return [
    'app' => [
        'name' => app_env('APP_NAME', 'The Elite English Academy'),
        'url' => app_env('APP_URL', ''),
        'env' => app_env('APP_ENV', 'production'),
        'debug' => filter_var(app_env('APP_DEBUG', 'false'), FILTER_VALIDATE_BOOLEAN),
        'session_name' => app_env('APP_SESSION_NAME', 'apoorwa_php_lms'),
    ],
    'db' => [
        'host' => app_env('DB_HOST', '127.0.0.1'),
        'port' => app_env('DB_PORT', '3306'),
        'name' => app_env('DB_NAME', 'apoorwa_lms_php'),
        'user' => app_env('DB_USER', 'root'),
        'pass' => app_env('DB_PASS', ''),
        'charset' => 'utf8mb4',
    ],
];
