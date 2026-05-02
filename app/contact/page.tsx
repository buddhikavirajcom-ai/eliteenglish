import Link from "next/link";
import { Clock3, Mail, MessageSquareHeart, Phone, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/public/section-heading";
import { SiteShell } from "@/components/public/site-shell";
import { Card } from "@/components/ui/card";
import { faqs, teacherBrand } from "@/lib/public-content";
import { getPublicClasses, getPublicTeacherProfile } from "@/lib/public-site";
import { formatScheduleDay, formatTimeRange } from "@/lib/utils";

export default async function ContactPage() {
  const [teacher, classes] = await Promise.all([getPublicTeacherProfile(), getPublicClasses()]);
  const emailHref = teacher?.email ? `mailto:${teacher.email}` : "/login";
  const phoneHref = teacher?.phone ? `tel:${teacher.phone}` : "/login";

  return (
    <SiteShell activePath="/contact">
      <section className="mx-auto w-full max-w-[1240px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-brand-700">Contact</p>
            <h1 className="font-display text-4xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-5xl">
              Talk to the teacher before you enroll.
            </h1>
            <p className="text-[15px] leading-8 text-slate-600 sm:text-base">{teacherBrand.contactIntro}</p>
            <div className="grid gap-4">
              <Card className="rounded-[1.75rem] border border-white/80 bg-white/95 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Phone</p>
                    <p className="text-sm text-slate-500">Best for quick schedule and class questions</p>
                  </div>
                </div>
                <p className="text-sm text-slate-700">{teacher?.phone ?? "Available after enrollment"}</p>
                <a href={phoneHref} className="mt-4 inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                  Call teacher
                </a>
              </Card>
              <Card className="rounded-[1.75rem] border border-white/80 bg-white/95 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Email</p>
                    <p className="text-sm text-slate-500">Best for detailed questions from parents</p>
                  </div>
                </div>
                <p className="text-sm text-slate-700">{teacher?.email ?? "Portal login available after enrollment"}</p>
                <a href={emailHref} className="mt-4 inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                  Send email
                </a>
              </Card>
            </div>
          </div>

          <div className="space-y-5">
            <Card className="rounded-[1.85rem] border border-white/80 bg-[linear-gradient(145deg,#ffffff_0%,#eef4ff_100%)] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
              <SectionHeading
                eyebrow="What you can ask"
                title="Useful topics before joining"
                description="Families usually contact the teacher to check fit, schedule, availability, and the most suitable class type."
              />
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  "Which class fits my child's level?",
                  "What time slots are currently open?",
                  "How much is the monthly fee?",
                  "How do progress updates work?"
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/80 bg-white/85 px-4 py-3 text-sm text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-[1.75rem] border border-white/80 bg-white/95 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">Current class schedule</p>
                  <p className="text-sm text-slate-500">Helpful when asking about a specific opening</p>
                </div>
              </div>
              <div className="space-y-3">
                {classes.length > 0 ? (
                  classes.slice(0, 4).map((lesson) => (
                    <div key={lesson.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
                      <p className="text-sm font-semibold text-slate-950">{lesson.title}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {formatScheduleDay(lesson.scheduleDay)} | {formatTimeRange(lesson.startTime, lesson.endTime)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">No active classes are listed right now. Please contact the teacher for the next available opening.</p>
                )}
              </div>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="rounded-[1.75rem] border border-white/80 bg-white/95 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
                <div className="mb-3 w-fit rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                  <MessageSquareHeart className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-slate-950">Parent-friendly support</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">Questions are welcome before enrollment, especially if you want help choosing the right class.</p>
              </Card>
              <Card className="rounded-[1.75rem] border border-white/80 bg-white/95 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
                <div className="mb-3 w-fit rounded-2xl bg-amber-50 p-3 text-amber-700">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-slate-950">Simple next step</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">Once enrolled, students and parents can log in to the portal for homework, progress, and updates.</p>
              </Card>
            </div>

            <div className="rounded-[1.75rem] border border-white/80 bg-white/95 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
              <p className="text-sm font-semibold text-slate-950">Quick FAQ</p>
              <div className="mt-4 space-y-3">
                {faqs.slice(0, 2).map((item) => (
                  <div key={item.question} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-950">{item.question}</p>
                    <p className="mt-1 text-sm leading-7 text-slate-600">{item.answer}</p>
                  </div>
                ))}
              </div>
              <Link href="/faq" className="mt-4 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-800">
                Open full FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}