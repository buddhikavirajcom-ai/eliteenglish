"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CircleDollarSign, ClipboardCheck, MessageSquareText, School, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StarRating } from "@/components/ui/star-rating";
import { average, cn, formatCurrency, formatDate, formatMonthLabel, formatScheduleDay, formatTimeRange } from "@/lib/utils";
import type { StudentProfile } from "@/types/lms";

const tabs = ["Overview", "Progress", "Homework", "Attendance", "Payments"] as const;
type Tab = (typeof tabs)[number];

function statusTone(status: string) {
  switch (status) {
    case "PAID":
    case "REVIEWED":
    case "PRESENT":
      return "emerald" as const;
    case "SUBMITTED":
      return "sky" as const;
    case "PENDING":
      return "amber" as const;
    default:
      return "rose" as const;
  }
}

export function StudentProfileView({ profile }: { profile: StudentProfile }) {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  const averageSkill = useMemo(() => {
    const latest = profile.progress[0];

    if (!latest) {
      return 0;
    }

    return average([latest.listening, latest.reading, latest.writing, latest.speaking]);
  }, [profile.progress]);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-slate-900 px-6 py-8 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/90">
                Student Profile
              </div>
              <div>
                <h2 className="font-display text-3xl font-semibold tracking-[-0.03em]">{profile.student.name}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">
                  Keep the essentials in one place for the teacher: contact details, current level, learning notes, progress, and parent-facing records.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`/dashboard/progress?studentId=${profile.student.id}`}>
                <Button className="bg-white text-slate-950 hover:bg-slate-100">Update Progress</Button>
              </Link>
              <Link href="/dashboard/homework">
                <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
                  Add Homework
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="grid gap-4 border-t border-border/70 px-6 py-5 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Grade</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{profile.student.grade || "Not added"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">School</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{profile.student.school || "Not added"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Learning Level</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{profile.student.learningLevel || "Not added"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Average Progress</p>
            <div className="mt-2 flex items-center gap-3">
              <StarRating value={Math.round(averageSkill)} readOnly size="sm" />
              <span className="text-sm font-semibold text-slate-900">{averageSkill ? averageSkill.toFixed(1) : "No data"}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              activeTab === tab ? "bg-brand-600 text-white shadow-sm" : "bg-white text-slate-600 ring-1 ring-border hover:bg-slate-50"
            )}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card>
            <CardHeader>
              <CardTitle>Student Snapshot</CardTitle>
              <CardDescription>Just the details a teacher needs in daily use.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-border/80 bg-muted/40 p-4">
                <div className="mb-2 flex items-center gap-2 font-semibold text-slate-900">
                  <UserRound className="h-4 w-4 text-brand-600" />
                  Contact
                </div>
                <p className="text-sm text-slate-700">Parent: {profile.student.parentName}</p>
                <p className="text-sm text-slate-700">Parent contact: {profile.student.parentContact || "Not added"}</p>
                <p className="text-sm text-slate-700">Phone: {profile.student.phone}</p>
                <p className="text-sm text-slate-700">Email: {profile.student.email || "Not added"}</p>
              </div>
              <div className="rounded-[1.5rem] border border-border/80 bg-muted/40 p-4">
                <div className="mb-2 flex items-center gap-2 font-semibold text-slate-900">
                  <School className="h-4 w-4 text-brand-600" />
                  Learning Context
                </div>
                <p className="text-sm text-slate-700">Level: {profile.student.learningLevel || "Not added"}</p>
                <p className="text-sm text-slate-700">Classes joined: {profile.student.classCount}</p>
                <p className="text-sm text-slate-700">Portal code: {profile.student.qrCode}</p>
              </div>
              <div className="rounded-[1.5rem] border border-border/80 bg-muted/40 p-4 md:col-span-2">
                <div className="mb-2 flex items-center gap-2 font-semibold text-slate-900">
                  <MessageSquareText className="h-4 w-4 text-brand-600" />
                  Notes
                </div>
                <p className="text-sm leading-6 text-slate-700">{profile.student.notes || "No notes added yet."}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Classes</CardTitle>
              <CardDescription>Weekly class blocks for this learner.</CardDescription>
            </CardHeader>
            <CardContent>
              {profile.classes.length === 0 ? (
                <EmptyState title="No classes yet" description="Assign this student to a class to see the timetable here." />
              ) : (
                <div className="space-y-3">
                  {profile.classes.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-border/70 bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{formatScheduleDay(item.scheduleDay)} - {formatTimeRange(item.startTime, item.endTime)}</p>
                        </div>
                        <Badge value={item.status} tone={statusTone(item.status)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {activeTab === "Progress" ? (
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
            <CardDescription>Monthly skill ratings and comments for parents.</CardDescription>
          </CardHeader>
          <CardContent>
            {profile.progress.length === 0 ? (
              <EmptyState title="No progress updates yet" description="Use the Update Progress action to add the first monthly review." />
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {profile.progress.map((entry) => (
                  <div key={entry.id} className="rounded-[1.5rem] border border-border/80 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">{formatMonthLabel(entry.month)}</p>
                      {entry.testMark !== null && entry.testMark !== undefined ? (
                        <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">Test mark: {entry.testMark}%</span>
                      ) : null}
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-muted/50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Listening</p>
                        <div className="mt-2">
                          <StarRating value={entry.listening} readOnly size="sm" />
                        </div>
                      </div>
                      <div className="rounded-2xl bg-muted/50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Reading</p>
                        <div className="mt-2">
                          <StarRating value={entry.reading} readOnly size="sm" />
                        </div>
                      </div>
                      <div className="rounded-2xl bg-muted/50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Writing</p>
                        <div className="mt-2">
                          <StarRating value={entry.writing} readOnly size="sm" />
                        </div>
                      </div>
                      <div className="rounded-2xl bg-muted/50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Speaking</p>
                        <div className="mt-2">
                          <StarRating value={entry.speaking} readOnly size="sm" />
                        </div>
                      </div>
                    </div>
                    {entry.comment ? <p className="mt-4 text-sm leading-6 text-slate-700">{entry.comment}</p> : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "Homework" ? (
        <Card>
          <CardHeader>
            <CardTitle>Homework</CardTitle>
            <CardDescription>Homework records and feedback in one parent-friendly view.</CardDescription>
          </CardHeader>
          <CardContent>
            {profile.homework.length === 0 ? (
              <EmptyState title="No homework yet" description="Homework assigned to this student will show here." />
            ) : (
              <div className="space-y-4">
                {profile.homework.map((item) => (
                  <div key={item.id} className="rounded-[1.5rem] border border-border/80 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.className} - Due {formatDate(item.deadline)}</p>
                      </div>
                      {item.submissions[0] ? <Badge value={item.submissions[0].status} tone={statusTone(item.submissions[0].status)} /> : null}
                    </div>
                    {item.description ? <p className="mt-3 text-sm leading-6 text-slate-700">{item.description}</p> : null}
                    {item.submissions[0]?.score !== null && item.submissions[0]?.score !== undefined ? (
                      <div className="mt-4 inline-flex rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
                        Result: {item.submissions[0].score}
                        {item.submissions[0].maxScore ? ` / ${item.submissions[0].maxScore}` : ""}
                      </div>
                    ) : null}
                    {item.submissions[0]?.feedback ? (
                      <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                        <p className="font-semibold">Teacher feedback</p>
                        <p className="mt-1">{item.submissions[0].feedback}</p>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "Attendance" ? (
        <Card>
          <CardHeader>
            <CardTitle>Attendance</CardTitle>
            <CardDescription>Simple present and absent history.</CardDescription>
          </CardHeader>
          <CardContent>
            {profile.attendance.length === 0 ? (
              <EmptyState title="No attendance records yet" description="Attendance entries will show here once classes are marked." />
            ) : (
              <div className="space-y-3">
                {profile.attendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between rounded-2xl border border-border/70 bg-white px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                        <ClipboardCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{formatDate(record.date)}</p>
                        <p className="text-sm text-muted-foreground">Attendance record</p>
                      </div>
                    </div>
                    <Badge value={record.status} tone={statusTone(record.status)} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "Payments" ? (
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
            <CardDescription>Recent fees and current status.</CardDescription>
          </CardHeader>
          <CardContent>
            {profile.payments.length === 0 ? (
              <EmptyState title="No payments yet" description="Payment records will appear here as they are added." />
            ) : (
              <div className="space-y-3">
                {profile.payments.map((payment) => (
                  <div key={payment.id} className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                        <CircleDollarSign className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-muted-foreground">{payment.type.toLowerCase()} - {formatDate(payment.date)}</p>
                      </div>
                    </div>
                    <Badge value={payment.status} tone={statusTone(payment.status)} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
