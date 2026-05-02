import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, CircleDollarSign, Clock3, GraduationCap, Users } from "lucide-react";
import { PublicEnrollmentForm } from "@/components/classes/public-enrollment-form";
import { SiteShell } from "@/components/public/site-shell";
import { Card } from "@/components/ui/card";
import { getPublicClassById } from "@/lib/public-site";
import { formatCurrency, formatDate, formatScheduleDay, formatTimeRange } from "@/lib/utils";

export default async function PublicClassEnrollmentPage({ params }: { params: { id: string } }) {
  const lesson = await getPublicClassById(params.id);

  if (!lesson) {
    notFound();
  }

  return (
    <SiteShell activePath="/classes">
      <section className="mx-auto w-full max-w-[1240px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-8 max-w-3xl space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-700">Online enrollment</p>
          <h1 className="font-display text-4xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-5xl">
            Request a seat in {lesson.title}
          </h1>
          <p className="text-[15px] leading-8 text-slate-600 sm:text-base">
            Send the class request first, then upload the payment slip so the teacher can review and approve the enrollment.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="space-y-4">
            <Card className="overflow-hidden rounded-[1.85rem] border border-white/80 bg-white/95 p-0 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
              <div className="bg-[linear-gradient(145deg,#0f172a_0%,#1d4ed8_100%)] p-6 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/65">Class summary</p>
                <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em]">{lesson.title}</h2>
                <p className="mt-2 text-sm text-white/80">{lesson.subject} for {lesson.level} learners</p>
              </div>
              <div className="grid gap-3 p-5">
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                  <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <CalendarDays className="h-4 w-4 text-brand-600" />
                    Next session
                  </div>
                  <p className="text-sm font-medium text-slate-900">{formatDate(lesson.date)}</p>
                  <p className="mt-1 text-sm text-slate-600">{formatScheduleDay(lesson.scheduleDay)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                  <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <Clock3 className="h-4 w-4 text-brand-600" />
                    Time
                  </div>
                  <p className="text-sm font-medium text-slate-900">{formatTimeRange(lesson.startTime, lesson.endTime)}</p>
                  <p className="mt-1 text-sm text-slate-600">Teacher: {lesson.teacherName}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                  <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <CircleDollarSign className="h-4 w-4 text-brand-600" />
                    Class fee
                  </div>
                  <p className="text-sm font-medium text-slate-900">{formatCurrency(lesson.fee)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                  <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <Users className="h-4 w-4 text-brand-600" />
                    Seats
                  </div>
                  <p className="text-sm font-medium text-slate-900">{lesson.seatsTaken} enrolled of {lesson.capacity}</p>
                </div>
                {lesson.notes ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm leading-7 text-amber-900">
                    {lesson.notes}
                  </div>
                ) : null}
              </div>
            </Card>

            <Card className="rounded-[1.75rem] border border-white/80 bg-white/95 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
              <div className="mb-3 inline-flex rounded-2xl bg-brand-50 p-3 text-brand-700">
                <GraduationCap className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-slate-950">Need help before you pay?</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Use the contact page if you need help choosing the class, confirming the schedule, or checking availability before sending the payment slip.
              </p>
              <Link href="/contact" className="mt-4 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-800">
                Contact teacher
              </Link>
            </Card>
          </div>

          <Card className="rounded-[1.85rem] border border-white/80 bg-white/95 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-slate-950">Enrollment request</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              This keeps the process simple: send the request, upload the slip, and wait for teacher approval.
            </p>
            <div className="mt-6">
              <PublicEnrollmentForm classId={lesson.id} classTitle={lesson.title} classFee={lesson.fee} />
            </div>
          </Card>
        </div>
      </section>
    </SiteShell>
  );
}