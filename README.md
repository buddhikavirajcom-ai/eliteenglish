# Apoorwa LMS

Production-ready Learning Management System built with:

- Next.js 14 App Router
- TypeScript
- Prisma ORM
- MySQL
- Tailwind CSS
- NextAuth credentials authentication

## Features

- Admin and student roles
- Student CRUD with QR codes
- Manual and QR-based attendance
- Payment tracking with paid and pending summaries
- Class scheduling with student assignments
- Quiz creation, attempts, and auto-scoring
- Admin dashboard analytics and recent activity

## Quick Start

1. Copy `.env.example` to `.env` and update `DATABASE_URL`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET`.
   If your MySQL username or password contains reserved URL characters like `@`, `#`, `:`, or `+`, URL-encode them inside `DATABASE_URL`.
2. Install dependencies:

```bash
npm install
```

3. Generate Prisma client:

```bash
npx prisma generate
```

4. Push the schema to MySQL:

```bash
npm run db:push
```

5. Seed demo data:

```bash
npm run db:seed
```

6. Start development:

```bash
npm run dev
```

## Demo Credentials

- Teacher: `admin@lms.local` / `admin123`
- Student: `0771234567` / `student123`

## Scripts

- `npm run dev`
- `npm run build`
- `npm run db:deploy`
- `npm run start`
- `npm run prisma:generate`
- `npm run db:push`
- `npm run db:seed`

## Notes

- Authentication uses NextAuth credentials with Prisma-backed users.
- Student portal logins use the student's phone number by default.
- Route handlers live under `app/api/*`.
- `npm run build` now generates the Prisma client and builds Next.js without running database migrations.
- Run `npm run db:deploy` separately in environments where you want Prisma migrations applied.
