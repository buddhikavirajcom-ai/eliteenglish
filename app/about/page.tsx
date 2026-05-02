import Link from "next/link";
import { BookOpenCheck, MessageSquareHeart, Sparkles, Users } from "lucide-react";
import { SectionHeading } from "@/components/public/section-heading";
import { SiteShell } from "@/components/public/site-shell";
import { Card } from "@/components/ui/card";
import { teacherBrand } from "@/lib/public-content";
import { getPublicTeacherProfile } from "@/lib/public-site";

export default async function AboutPage() {
  const teacher = await getPublicTeacherProfile();

  return (
    <SiteShell activePath="/about">
      <section className="mx-auto w-full max-w-[1240px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-brand-700">About</p>
            <h1 className="font-display text-4xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-5xl">
              Personal English teaching with clarity, calm, and care.
            </h1>
            <p className="text-[15px] leading-8 text-slate-600 sm:text-base">{teacherBrand.aboutIntro}</p>
            <div className="rounded-[1.75rem] border border-white/80 bg-[linear-gradient(145deg,#0f172a_0%,#1d4ed8_100%)] p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/65">Teacher profile</p>
              <h2 className="mt-2 font-display text-2xl font-semibold">{teacher?.name ?? "Private English Teacher"}</h2>
              <p className="mt-3 text-sm leading-7 text-white/80">
                Supporting school learners with structured lessons, readable feedback, and a teaching style that stays both professional and approachable.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="rounded-[1.75rem] border border-white/80 bg-white/95 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] sm:col-span-2">
              <SectionHeading
                eyebrow="Teaching style"
                title="What students and parents can expect"
                description="The aim is not to overload students. Each lesson is designed to be easy to follow, useful for school progress, and supportive of confidence in English."
              />
            </Card>
            {teacherBrand.teachingPillars.map((pillar, index) => {
              const Icon = [BookOpenCheck, Users, MessageSquareHeart][index] ?? Sparkles;

              return (
                <Card key={pillar.title} className="rounded-[1.75rem] border border-white/80 bg-white/95 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
                  <div className="mb-4 inline-flex rounded-2xl bg-brand-50 p-3 text-brand-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-xl font-semibold tracking-[-0.03em] text-slate-950">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{pillar.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-white/70 bg-white/70">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-[1.75rem] border border-white/80 bg-white/95 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Active classes</p>
              <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-slate-950">{teacher?.activeClassCount ?? 0}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">Focused class options currently open for families to review.</p>
            </Card>
            <Card className="rounded-[1.75rem] border border-white/80 bg-white/95 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Current learners</p>
              <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-slate-950">{teacher?.totalStudents ?? 0}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">Students receiving simple, steady support across active sessions.</p>
            </Card>
            <Card className="rounded-[1.75rem] border border-white/80 bg-white/95 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Subjects and levels</p>
              <p className="mt-3 text-sm font-semibold leading-7 text-slate-950">
                {teacher?.subjects.join(", ") || "English language support"}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {teacher?.levels.join(", ") || "A range of school learner levels"}
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/80 bg-[linear-gradient(145deg,#fff7ed_0%,#ffffff_40%,#eef4ff_100%)] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-7">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] text-slate-950">A learning experience built for trust</h2>
          <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600 sm:text-[15px]">
            Families should feel that learning is organized, manageable, and worth their time. That is why the website, class structure, and portal are all designed to stay clean and easy to use.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/classes" className="inline-flex items-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              View classes
            </Link>
            <Link href="/contact" className="inline-flex items-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
              Contact teacher
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}