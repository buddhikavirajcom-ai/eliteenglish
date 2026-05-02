import { redirect } from "next/navigation";
import { BookOpenCheck, CalendarClock, GraduationCap, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";

const featureItems = [
  {
    icon: GraduationCap,
    title: "Academic operations",
    description: "Manage classes, students, and teaching schedules from one calm workspace."
  },
  {
    icon: CalendarClock,
    title: "Attendance and billing",
    description: "Keep QR attendance, payment tracking, and reminders visible and consistent."
  },
  {
    icon: BookOpenCheck,
    title: "Learning progress",
    description: "Run quizzes, review outcomes, and surface the right details for students quickly."
  },
  {
    icon: ShieldCheck,
    title: "Flexible sign-in",
    description: "Use Google for quick access or continue with your existing teacher and student credentials."
  }
];

export default async function LoginPage() {
  const user = await getCurrentUser();
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="page-shell grid min-h-screen items-center gap-10 py-12 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-login-glow p-8 shadow-panel sm:p-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-white/70 to-transparent" />
        <div className="relative space-y-8">
          <div className="inline-flex rounded-full border border-brand-200 bg-white/75 px-4 py-2 text-sm font-semibold text-brand-700 shadow-sm">
            Premium academic operations for modern learning centers
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl font-display text-4xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 sm:text-5xl">
              A polished LMS for classes, payments, attendance, and progress management.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Apoorwa LMS is designed for day-to-day academic operations, giving admins and students a clearer dashboard,
              stronger data flow, and a calmer experience across every core workflow.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {featureItems.map(({ icon: Icon, title, description }) => (
              <div key={title} className="glass-panel p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-brand-50 p-3 text-brand-700 ring-1 ring-brand-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display text-lg font-semibold tracking-[-0.02em] text-slate-950">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Card className="max-w-xl border-white/90 bg-white/95">
        <CardHeader>
          <CardTitle>Sign in to Apoorwa LMS</CardTitle>
          <CardDescription>
            {googleEnabled
              ? "Continue with Google or use your portal credentials to access the latest dashboard and management tools."
              : "Use your portal credentials to access the latest dashboard and management tools."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm googleEnabled={googleEnabled} />
        </CardContent>
      </Card>
    </main>
  );
}
