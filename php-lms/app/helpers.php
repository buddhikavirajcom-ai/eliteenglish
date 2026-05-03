<?php

declare(strict_types=1);

function app_env(string $key, ?string $default = null): ?string
{
    $value = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);

    if ($value === false || $value === null || $value === '') {
        return $default;
    }

    return (string) $value;
}

function app_config(string $key, mixed $default = null): mixed
{
    static $config = null;

    if ($config === null) {
        $config = require __DIR__ . '/config.php';
    }

    $segments = explode('.', $key);
    $value = $config;

    foreach ($segments as $segment) {
        if (!is_array($value) || !array_key_exists($segment, $value)) {
            return $default;
        }

        $value = $value[$segment];
    }

    return $value;
}

function app_base_url(string $path = ''): string
{
    $base = rtrim((string) app_config('app.url', ''), '/');
    $path = ltrim($path, '/');

    return $path === '' ? $base : $base . '/' . $path;
}

function app_h(string|null $value): string
{
    return htmlspecialchars((string) ($value ?? ''), ENT_QUOTES, 'UTF-8');
}

function app_redirect(string $path): never
{
    header('Location: ' . app_base_url($path));
    exit;
}

function app_method(): string
{
    return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
}

function app_is_post(): bool
{
    return app_method() === 'POST';
}

function app_path(): string
{
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $scriptName = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? ''));
    $basePath = rtrim($scriptName, '/');

    if ($basePath !== '' && $basePath !== '/' && str_starts_with($uri, $basePath)) {
        $uri = substr($uri, strlen($basePath)) ?: '/';
    }

    return '/' . trim($uri, '/');
}

function app_input(string $key, mixed $default = null): mixed
{
    return $_POST[$key] ?? $_GET[$key] ?? $default;
}

function app_old(string $key, mixed $default = ''): mixed
{
    $old = $_SESSION['_old'] ?? [];

    return $old[$key] ?? $default;
}

function app_set_old(array $data): void
{
    $_SESSION['_old'] = $data;
}

function app_clear_old(): void
{
    unset($_SESSION['_old']);
}

function app_errors(): array
{
    return $_SESSION['_errors'] ?? [];
}

function app_set_errors(array $errors): void
{
    $_SESSION['_errors'] = $errors;
}

function app_clear_errors(): void
{
    unset($_SESSION['_errors']);
}

function app_error(string $key): ?string
{
    $errors = app_errors();

    return isset($errors[$key][0]) ? (string) $errors[$key][0] : null;
}

function app_uuid(): string
{
    $bytes = random_bytes(16);
    $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
    $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);

    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($bytes), 4));
}

function app_date(string|null $value, string $format = 'd M Y'): string
{
    if (!$value) {
        return '-';
    }

    $time = strtotime($value);

    return $time ? date($format, $time) : $value;
}

function app_currency(float|int|string|null $value): string
{
    return 'Rs. ' . number_format((float) ($value ?? 0), 2);
}

function app_percent(float|int $value): string
{
    return number_format((float) $value, 0) . '%';
}

function app_schedule_day_label(string|null $value): string
{
    if ($value === null || $value === '') {
        return '-';
    }

    return ucwords(strtolower(str_replace('_', ' ', $value)));
}

function app_time_label(string|null $value): string
{
    if ($value === null || $value === '') {
        return '-';
    }

    $timestamp = strtotime($value);

    return $timestamp ? date('h:i A', $timestamp) : $value;
}

function app_time_range(string|null $start, string|null $end): string
{
    return app_time_label($start) . ' - ' . app_time_label($end);
}

function app_storage_path(string $path = ''): string
{
    $root = dirname(__DIR__);
    $full = $root . '/storage/' . ltrim($path, '/');

    return str_replace('\\', '/', $full);
}

function app_public_upload_url(string $relativePath): string
{
    return app_base_url('index.php?download=' . urlencode($relativePath));
}

function app_status_badge(string $value): string
{
    $class = match (strtoupper($value)) {
        'ONLINE' => 'badge badge-success',
        'OFFLINE' => 'badge badge-warning',
        'ACTIVE', 'PAID', 'PRESENT', 'APPROVED', 'REVIEWED' => 'badge badge-success',
        'PENDING', 'DRAFT', 'REQUESTED', 'PAYMENT_SUBMITTED', 'SUBMITTED' => 'badge badge-warning',
        'ABSENT', 'REJECTED', 'CANCELLED' => 'badge badge-danger',
        default => 'badge',
    };

    return '<span class="' . $class . '">' . app_h($value) . '</span>';
}

function app_array_get(array $array, string $key, mixed $default = null): mixed
{
    return array_key_exists($key, $array) ? $array[$key] : $default;
}
