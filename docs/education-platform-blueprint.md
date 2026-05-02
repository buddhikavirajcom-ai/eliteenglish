# Education Platform Blueprint

## Product Direction
Transform the current LMS into a compact education platform with one shared design system, a public website, and four clear role-based portal experiences: student, parent, teacher, and admin. The UI should be slightly smaller than the current product, with tighter spacing, smaller cards, compact tables, quieter shadows, and simpler decision paths.

## Information Architecture
- Public website: marketing, admissions, registration, trust-building, portal access.
- Student portal: daily learning view focused on schedule, work, results, fees, and notices.
- Parent portal: child overview, attendance, results, fees, notices, and communication.
- Teacher portal: classes, attendance, assignments, marks, notices, and messaging.
- Admin portal: operations, admissions, people, academics, fees, content, and settings.

## Sitemap
- `/`
- `/about`
- `/courses`
- `/admissions`
- `/register`
- `/contact`
- `/faq`
- `/news`
- `/testimonials`
- `/portal-access`
- `/portal/student/*`
- `/portal/parent/*`
- `/portal/teacher/*`
- `/portal/admin/*`

## Sidebar Navigation By Role
- Student: Dashboard, Profile, Schedule, Attendance, Assignments, Exams & Results, Fees, Notices, Messages, Documents
- Parent: Dashboard, Child Profile, Attendance, Results, Fees, Notices, Communication, Reports
- Teacher: Dashboard, Classes, Students, Attendance Entry, Assignments, Marks, Notices, Messages
- Admin: Dashboard, Students, Parents, Teachers, Admissions, Courses, Attendance, Exams, Fees, Announcements, Website Content, Settings

## Shared Layout Rules
- Use a compact shell: 14-16px body copy, tighter card padding, 40-44px controls, smaller table rows, and more whitespace between sections than inside components.
- Use a consistent top bar with breadcrumbs, page title, small summary text, and 1-3 quick actions.
- Keep each portal task-first: summary cards first, main table/list second, advanced settings last.

## Core Entities
- User: account, role, auth, status, last login
- Student: personal profile, academic profile, health notes, emergency contact, documents, portal account
- ParentGuardian: contact and relationship details, communication preferences, linked students
- Teacher: profile, subjects, classes, availability, portal account
- AdmissionApplication: student info, guardian info, requested course/grade, uploaded documents, review status
- Course: title, code, level, subject, teacher, fee, academic year
- ClassSection: schedule, room/link, teacher, enrolled students
- AttendanceRecord: student, class, date, status, note
- Assignment: class, due date, attachment, submissions, feedback
- Exam: class, subject, date, marks schema
- Result: student, exam, subject marks, grade, remarks
- FeeInvoice: student, billing period, amount, due date, status
- Announcement: audience, title, content, publish window
- MessageThread: sender, recipient group, messages
- Document: owner, type, file, verification status
- NewsPost, FAQItem, Testimonial, WebsitePageBlock: public website content

## Registration Flow
1. Visitor opens `/register`.
2. Step 1 collects student basics.
3. Step 2 collects address and academic details.
4. Step 3 collects parent and guardian details.
5. Step 4 uploads required documents.
6. Step 5 reviews and submits.
7. Submission creates an `AdmissionApplication` in `PENDING` state.
8. Admin reviews, requests corrections if needed, approves, then converts to Student + ParentGuardian + User accounts.

## Recommended Next.js Structure
- `app/(marketing)/...` for public pages
- `app/(portal)/portal/student/...`
- `app/(portal)/portal/parent/...`
- `app/(portal)/portal/teacher/...`
- `app/(portal)/portal/admin/...`
- `components/layout/*` shared shells and nav
- `components/dashboard/*` summary cards, quick actions, tables
- `components/forms/*` field wrappers, stepper, upload field, compact inputs
- `components/admissions/*` public registration and admin review
- `components/public/*` hero, feature grid, testimonials, faq, news list
- `lib/auth/*`, `lib/permissions/*`, `lib/validators/*`, `lib/mappers/*`

## Compact Design Tokens
- Primary: academic blue / indigo
- Background: soft gray with white surfaces
- Radius: `xl` for cards, `lg` for controls
- Shadow: soft, short, low-contrast
- Table row height: compact with strong zebra/hover states
- Font: Inter or Plus Jakarta Sans with slightly smaller scale than current dashboard

## Example Portal Shell
```tsx
export function PortalShell({ title, breadcrumb, actions, children }: PortalShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="w-64 border-r border-slate-200 bg-white" />
      <main className="px-5 py-4 lg:px-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{breadcrumb}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{title}</h1>
          </div>
          <div className="flex gap-2">{actions}</div>
        </div>
        {children}
      </main>
    </div>
  );
}
```

## Example Role Dashboard Shape
```tsx
<section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
  <CompactStatCard title="Today’s Classes" value="4" />
  <CompactStatCard title="Pending Fees" value="12" />
  <CompactStatCard title="Assignments" value="7" />
  <CompactStatCard title="Unread Notices" value="3" />
</section>
<section className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
  <TodaySchedule />
  <QuickActions />
</section>
<section className="mt-5">
  <RecentNotices />
</section>
```

## Example Registration Wizard Shape
```tsx
const admissionSchema = z.object({
  student: z.object({
    fullName: z.string().min(2),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]),
    dob: z.string(),
    email: z.string().email().optional(),
    phone: z.string().min(7),
    gradeClass: z.string().min(1),
    academicYear: z.string().min(1)
  }),
  parent: z.object({
    fatherName: z.string().optional(),
    motherName: z.string().optional(),
    guardianName: z.string().min(2),
    guardianPhone: z.string().min(7),
    preferredCommunicationMethod: z.enum(["PHONE", "EMAIL", "WHATSAPP"])
  })
});
```

## Suggested Prisma Models
```prisma
model AdmissionApplication {
  id          String   @id @default(cuid())
  status      AdmissionStatus @default(PENDING)
  studentData Json
  parentData  Json
  documents   Json
  submittedAt DateTime @default(now())
  reviewedAt  DateTime?
  reviewedBy  String?
}

model ParentGuardian {
  id        String   @id @default(cuid())
  name      String
  relation  String
  phone     String
  email     String?
  address   String?
  users     User[]
}
```

## Phased Implementation Plan
1. Establish route groups, shared shells, compact tokens, breadcrumbs, and public site navigation.
2. Expand auth and role permissions for student, parent, teacher, and admin portals.
3. Add admissions schema and public registration workflow.
4. Build student, parent, teacher, and admin dashboards using shared compact widgets.
5. Move academic modules under reusable resource patterns: tables, filters, forms, status badges, uploads.
6. Add CMS-lite content management for public pages, news, FAQ, and testimonials.
7. Harden with audit trails, file validation, responsive QA, and accessibility review.