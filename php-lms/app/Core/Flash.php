<?php

declare(strict_types=1);

namespace PhpLms\Core;

final class Flash
{
    public static function success(string $message): void
    {
        $_SESSION['_flash'][] = ['type' => 'success', 'message' => $message];
    }

    public static function error(string $message): void
    {
        $_SESSION['_flash'][] = ['type' => 'error', 'message' => $message];
    }

    public static function messages(): array
    {
        $messages = $_SESSION['_flash'] ?? [];
        unset($_SESSION['_flash']);

        return $messages;
    }
}

