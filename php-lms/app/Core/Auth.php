<?php

declare(strict_types=1);

namespace PhpLms\Core;

final class Auth
{
    public function __construct(private readonly SecureMySQL $db)
    {
    }

    public function attempt(string $identifier, string $password): bool
    {
        $normalizedEmail = strtolower(trim($identifier));
        $identifier = trim($identifier);

        $user = $this->db->fetch(
            'SELECT u.*, s.id AS student_id
             FROM users u
             LEFT JOIN students s ON s.user_id = u.id
             WHERE LOWER(COALESCE(u.email, "")) = :email OR u.phone = :phone
             LIMIT 1',
            [
                'email' => $normalizedEmail,
                'phone' => $identifier,
            ]
        );

        if (!$user || !password_verify($password, (string) $user['password_hash'])) {
            return false;
        }

        $this->login($user);

        return true;
    }

    public function login(array $user): void
    {
        session_regenerate_id(true);

        $_SESSION['auth'] = [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'phone' => $user['phone'],
            'role' => $user['role'],
            'student_id' => $user['student_id'] ?? null,
        ];
    }

    public function user(): ?array
    {
        return $_SESSION['auth'] ?? null;
    }

    public function check(): bool
    {
        return $this->user() !== null;
    }

    public function id(): ?string
    {
        return $this->user()['id'] ?? null;
    }

    public function studentId(): ?string
    {
        return $this->user()['student_id'] ?? null;
    }

    public function isAdmin(): bool
    {
        return ($this->user()['role'] ?? null) === 'ADMIN';
    }

    public function logout(): void
    {
        unset($_SESSION['auth']);
        session_regenerate_id(true);
    }
}

