# Apoorwa LMS PHP

Standalone PHP and MySQL port of the LMS in this repository.

## Highlights

- Secure PDO-based MySQL wrapper with prepared statements
- Session-based authentication for admin and student roles
- CSRF protection on form submissions
- Public class listing and enrollment request flow
- Admin and student dashboards
- Student, class, attendance, payment, progress, homework, material, message, quiz, and enrollment request modules

## Folder layout

- `public/` front controller, rewrite rules, and assets
- `app/` bootstrap, core classes, controller, and views
- `database/schema.sql` MySQL schema
- `database/seed.php` demo seed script
- `storage/uploads/` uploaded files

## Setup

1. Copy `.env.example` to `.env` and update the database credentials.
2. Create a MySQL database.
3. Import `database/schema.sql`.
4. Seed demo data:

```bash
php database/seed.php
```

5. Point your web server document root to `public/`.

## Demo logins

- Admin: `admin@lms.local` / `admin123`
- Student: `0771234567` / `student123`

## Notes

- This app uses local uploads in `storage/uploads`.
- For Apache, `public/.htaccess` rewrites all requests to `public/index.php`.
- If your host does not expose environment variables, the included `.env` loader will read from `php-lms/.env`.

