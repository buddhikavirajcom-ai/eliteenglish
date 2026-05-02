import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  MonitorPlay,
  Users
} from "lucide-react";
import type { PublicClassRecord } from "@/lib/public-site";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  cn,
  formatCurrency,
  formatDate,
  formatScheduleDay,
  formatTimeRange
} from "@/lib/utils";

function toneForClassType(type: string): "sky" | "emerald" {
  return type === "ONLINE" ? "sky" : "emerald";
}

export function ClassListingCard({
  lesson,
  featured = false
}: {
  lesson: PublicClassRecord;
  featured?: boolean;
}) {
  const remainingSeats = Math.max(lesson.capacity - lesson.seatsTaken, 0);

  return (
    <Card
      className={cn(
        "group overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/95 p-0 shadow-[0_22px_60px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(15,23,42,0.14)]",
        featured && "ring-1 ring-brand-100"
      )}
    >
      <div className="border-b border-slate-100 bg-gradient-to-br from-slate-950 via-slate-900 to-brand-800 p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/65">
              {lesson.subject}
            </p>
            <h3 className="max-w-xl font-display text-2xl font-semibold tracking-[-0.03em] text-white">
              {lesson.title}
            </h3>
            <p className="text-sm text-white/75">
              {lesson.level} learners with personal guidance and clear weekly
              practice.
            </p>
          </div>
          <Badge value={lesson.type} tone={toneForClassType(lesson.type)} />
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <CalendarDays className="h-3.5 w-3.5 text-brand-600" />
              Schedule
            </div>
            <p className="text-sm font-medium text-slate-900">
              {formatScheduleDay(lesson.scheduleDay)}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {formatDate(lesson.date, "dd MMM yyyy")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <Clock3 className="h-3.5 w-3.5 text-brand-600" />
              Time
            </div>
            <p className="text-sm font-medium text-slate-900">
              {formatTimeRange(lesson.startTime, lesson.endTime)}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Teacher: {lesson.teacherName}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <CircleDollarSign className="h-3.5 w-3.5 text-brand-600" />
              Fee
            </div>
            <p className="text-sm font-medium text-slate-900">
              {formatCurrency(lesson.fee)}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Premium, focused class experience
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <MonitorPlay className="h-3.5 w-3.5 text-brand-600" />
              Format
            </div>
            <p className="text-sm font-medium text-slate-900">
              {lesson.type === "ONLINE"
                ? "Live online session"
                : lesson.location || "In-person class"}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {remainingSeats > 0
                ? `${remainingSeats} seats available`
                : "Waitlist available"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users className="h-4 w-4 text-brand-600" />
            <span>
              {lesson.seatsTaken} enrolled of {lesson.capacity}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/classes/${lesson.id}/enroll`}
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Enroll online
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Ask a question
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
