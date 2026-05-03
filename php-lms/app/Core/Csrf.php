<?php

declare(strict_types=1);

namespace PhpLms\Core;

use RuntimeException;

final class Csrf
{
    public static function token(): string
    {
        if (empty($_SESSION['_csrf'])) {
            $_SESSION['_csrf'] = bin2hex(random_bytes(32));
        }

        return (string) $_SESSION['_csrf'];
    }

    public static function field(): string
    {
        return '<input type="hidden" name="_token" value="' . htmlspecialchars(self::token(), ENT_QUOTES, 'UTF-8') . '">';
    }

    public static function validate(?string $token): void
    {
        $sessionToken = $_SESSION['_csrf'] ?? '';

        if (!$token || !$sessionToken || !hash_equals((string) $sessionToken, $token)) {
            throw new RuntimeException('The form session expired. Please try again.');
        }
    }
}

