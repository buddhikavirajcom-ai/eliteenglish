import Link from "next/link";
import { Clock3, GraduationCap, Sparkles } from "lucide-react";
import { ClassListingCard } from "@/components/public/class-listing-card";
import { SectionHeading } from "@/components/public/section-heading";
import { SiteShell } from "@/components/public/site-shell";
import { Badge } from "@/components/ui/badge";
import { teacherBrand } from "@/lib/public-content";
import { getPublicClasses, getPublicTeacherProfile } from "@/lib/public-site";

export default async function PublicClassesPage() {
  const [classes, teacher] = await Promise.all([getPublicClasses(), getPublicTeacherProfile()]);

  return (
    <SiteShell activePath="/classes">
      <section className="mx-auto w-full max-w-[1240px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="space-y-4">
            <Badge value="Classes" tone="sky" />
            <h1 className="font-display text-4xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-5xl">
              Clean, premium English classes for focused learners.
            </h1>
            <p className="max-w-2xl text-[15px] leading-8 text-slate-600 sm:text-base">
              {teacherBrand.courseIntro}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/80 bg-white/90 px-4 py-4 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
              <div className="mb-2 inline-flex rounded-2xl bg-brand-50 p-2.5 text-brand-700">
                <GraduationCap className="h-4 w-4" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Teacher</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{teacher?.name ?? "Private English Teacher"}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/80 bg-white/90 px-4 py-4 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
              <div className="mb-2 inline-flex rounded-2xl bg-amber-50 p-2.5 text-amber-700">
                <Clock3 className="h-4 w-4" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Published</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{classes.length} active classes</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/80 bg-white/90 px-4 py-4 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
              <div className="mb-2 inline-flex rounded-2xl bg-emerald-50 p-2.5 text-emerald-700">
                <Sparkles className="h-4 w-4" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Experience</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">Warm, structured, and parent-friendly</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-4 pb-14 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Open classes"
          title="Choose the class style that fits your child best"
          description="Each course card keeps the details easy to scan: level, time, format, fee, and teacher."
          action={
            <Link href="/contact" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
              Ask about enrollment
            </Link>
          }
        />
        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          {classes.length > 0 ? (
            classes.map((lesson) => (
              <ClassListingCard key={lesson.id} lesson={lesson} />
            ))
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/80 px-6 py-10 text-sm text-slate-600 xl:col-span-2">
              No classes are published right now. Please use the contact page to ask about the next available intake.
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
