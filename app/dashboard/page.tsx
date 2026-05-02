/* eslint-disable @next/next/no-img-element */

import QRCode from "qrcode";
import { BookOpenCheck, CalendarDays, ClipboardCheck, DollarSign, QrCode, Users } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { classInclude } from "@/lib/classes";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, formatPercent, formatScheduleDay, formatTimeRange } from "@/lib/utils";

function activityTone(index: number): "emerald" | "amber" | "sky" {
  return ["emerald", "amber", "sky"][index % 3] as "emerald" | "amber" | "sky";
}

export default async function DashboardPage() {
  const user = await requireAuth();

  if (user.role === "ADMIN") {
    const [totalStudents, paidSummary, attendanceSummary, recentPayments, recentAttendance, recentResults, upcomingClasses] = await Promise.all([
      prisma.student.count(),
      prisma.payment.aggregate({
        _sum: {
          amount: true
        },
        where: {
          status: "PAID"
        }
      }),
      prisma.attendance.groupBy({
        by: ["status"],
        _count: {
          _all: true
        }
      }),
      prisma.payment.findMany({
        take: 4,
        orderBy: {
          createdAt: "desc"
        },
        include: {
          student: true
        }
      }),
      prisma.attendance.findMany({
        take: 4,
        orderBy: {
          createdAt: "desc"
        },
        include: {
          student: true
        }
      }),
      prisma.result.findMany({
        take: 4,
        orderBy: {
          submittedAt: "desc"
        },
        include: {
          quiz: true,
          student: true
        }
      }),
      prisma.class.findMany({
        take: 4,
        where: {
          status: {
            in: ["ACTIVE", "DRAFT"]
          }
        },
        orderBy: [{ date: "asc" }, { time: "asc" }],
        include: classInclude
      })
    ]);

    const presentCount = attendanceSummary.find((item) => item.status === "PRESENT")?._count._all ?? 0;
    const totalAttendance = attendanceSummary.reduce((sum, item) => sum + item._count._all, 0);
    const attendanceRate = totalAttendance === 0 ? 0 : (presentCount / totalAttendance) * 100;

    const activities = [
      ...recentPayments.map((payment) => ({
        id: payment.id,
        title: "Payment recorded",
        description: `${payment.student.name} ${payment.status === "PAID" ? "paid" : "has pending"} ${formatCurrency(Number(payment.amount))}`,
        timestamp: payment.createdAt,
        tone: "emerald" as const
      })),
      ...recentAttendance.map((attendance) => ({
        id: attendance.id,
        title: "Attendance updated",
        description: `${attendance.student.name} marked ${attendance.status.toLowerCase()}`,
        timestamp: attendance.createdAt,
        tone: "amber" as const
      })),
      ...recentResults.map((result) => ({
        id: result.id,
        title: "Quiz submitted",
        description: `${result.student.name} scored ${result.score}/${result.totalQuestions} on ${result.quiz.title}`,
        timestamp: result.submittedAt,
        tone: "sky" as const
      }))
    ]
      .sort((left, right) => right.timestamp.getTime() - left.timestamp.getTime())
      .slice(0, 6);

    return (
      <div className="space-y-8">
        <Header
          title="Operations Dashboard"
          subtitle="Admin Overview"
          description="Track learner activity, payment progress, class scheduling, and recent academic movement from a single premium dashboard."
        />

        <section className="stat-grid">
          <StatCard title="Total Students" value={`${totalStudents}`} hint="Active student records" icon={Users} />
          <StatCard title="Paid Revenue" value={formatCurrency(Number(paidSummary._sum.amount ?? 0))} hint="Collected payments" icon={DollarSign} />
          <StatCard title="Attendance Rate" value={formatPercent(attendanceRate)} hint="Present vs total attendance" icon={ClipboardCheck} />
          <StatCard title="Upcoming Classes" value={`${upcomingClasses.length}`} hint="Next scheduled sessions" icon={CalendarDays} />
        </section>

        <section className="section-grid">
          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Latest operational changes across payments, attendance, and quiz results.</CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <EmptyState title="No activity yet" description="Once you start using the system, activity will appear here." />
              ) : (
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className="rounded-2xl border border-border/80 bg-white/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{activity.title}</p>
                          <p className="mt-1 text-sm text-slate-600">{activity.description}</p>
                        </div>
                        <Badge value={activity.tone.toUpperCase()} tone={activityTone(index)} />
                      </div>
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">{formatDate(activity.timestamp, "dd MMM yyyy, hh:mm a")}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming class schedule</CardTitle>
              <CardDescription>Quick visibility into the next classes students will see in the portal.</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingClasses.length === 0 ? (
                <EmptyState title="No scheduled classes" description="Create a class to populate the upcoming schedule panel." />
              ) : (
                <div className="space-y-4">
                  {upcomingClasses.map((lesson) => (
                    <div key={lesson.id} className="rounded-2xl border border-border/80 bg-white/70 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{lesson.title}</p>
                          <p className="mt-1 text-sm text-slate-600">{lesson.subject} - {lesson.level}</p>
                        </div>
                        <Badge value={lesson.status} tone={lesson.status === "ACTIVE" ? "emerald" : lesson.status === "DRAFT" ? "amber" : "slate"} />
                      </div>
                      <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                        <p>{formatDate(lesson.date)} - {formatScheduleDay(lesson.scheduleDay)} - {formatTimeRange(lesson.time, lesson.endTime)}</p>
                        <p>{lesson.teacher.name} - {lesson.enrollments.length}/{lesson.capacity} students assigned</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    );
  }

  const student = await prisma.student.findUnique({
    where: {
      id: user.studentId ?? ""
    },
    include: {
      attendances: {
        orderBy: {
          date: "desc"
        }
      },
      payments: {
        orderBy: {
          date: "desc"
        }
      },
      enrollments: {
        include: {
          class: {
            include: {
              teacher: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true
                }
              }
            }
          }
        },
        orderBy: {
          class: {
            date: "asc"
          }
        }
      },
      results: {
        include: {
          quiz: true
        },
        orderBy: {
          submittedAt: "desc"
        }
      },
      homeworkEntries: {
        include: {
          homework: {
            include: {
              class: true
            }
          }
        },
        orderBy: [{ homework: { deadline: "asc" } }, { createdAt: "desc" }]
      }
    }
  });

  if (!student) {
    return <EmptyState title="Student profile missing" description="This account is missing a linked student profile." />;
  }

  const qrPreview = await QRCode.toDataURL(student.qrCode);
  const presentCount = student.attendances.filter((item) => item.status === "PRESENT").length;
  const attendanceRate = student.attendances.length === 0 ? 0 : (presentCount / student.attendances.length) * 100;
  const paidTotal = student.payments.filter((item) => item.status === "PAID").reduce((sum, item) => sum + Number(item.amount), 0);
  const pendingTotal = student.payments.filter((item) => item.status === "PENDING").reduce((sum, item) => sum + Number(item.amount), 0);
  const upcomingEnrollments = student.enrollments.slice(0, 3);
  const latestHomework = student.homeworkEntries.slice(0, 3);

  return (
    <div className="space-y-8">
      <Header
        title={`Welcome back, ${student.name}`}
        subtitle="Student Overview"
        description="Keep your classes, attendance, payments, and latest quiz outcomes visible from one clean student dashboard."
      />

      <section className="stat-grid">
        <StatCard title="Attendance Rate" value={formatPercent(attendanceRate)} hint="Your present days" icon={ClipboardCheck} />
        <StatCard title="Paid Total" value={formatCurrency(paidTotal)} hint="Payments completed" icon={DollarSign} />
        <StatCard title="Pending Balance" value={formatCurrency(pendingTotal)} hint="Outstanding amount" icon={BookOpenCheck} />
        <StatCard title="Upcoming Classes" value={`${student.enrollments.length}`} hint="Assigned sessions" icon={Users} />
      </section>

      <section className="section-grid">
        <Card>
          <CardHeader>
            <CardTitle>Your QR attendance code</CardTitle>
            <CardDescription>Teachers can use this QR string on the attendance page to simulate scanning.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 md:flex-row md:items-center">
            <img alt={`${student.name} QR`} className="h-36 w-36 rounded-3xl border border-border bg-white p-4 shadow-sm" src={qrPreview} />
            <div className="space-y-3">
              <div className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-800 ring-1 ring-brand-100">
                <QrCode className="mr-2 h-4 w-4" />
                {student.qrCode}
              </div>
              <p className="text-sm text-slate-600">Share this code with your teacher for fast attendance check-ins.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next classes</CardTitle>
            <CardDescription>Your upcoming lessons with time, day, and teacher details.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingEnrollments.length === 0 ? (
              <EmptyState title="No classes assigned" description="Your teacher will add classes here once you are enrolled." />
            ) : (
              <div className="space-y-4">
                {upcomingEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="rounded-2xl border border-border/80 bg-white/70 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{enrollment.class.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{enrollment.class.subject} - {enrollment.class.level}</p>
                      </div>
                      <Badge value={enrollment.class.type} tone={enrollment.class.type === "ONLINE" ? "sky" : "amber"} />
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                      <p>{formatDate(enrollment.class.date)} - {formatScheduleDay(enrollment.class.scheduleDay)} - {formatTimeRange(enrollment.class.time, enrollment.class.endTime)}</p>
                      <p>{enrollment.class.teacher.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Latest quiz results</CardTitle>
          <CardDescription>Your most recent submissions and scores.</CardDescription>
        </CardHeader>
        <CardContent>
          {student.results.length === 0 ? (
            <EmptyState title="No quiz submissions yet" description="Quizzes assigned by your teacher will appear under the quizzes tab." />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {student.results.slice(0, 4).map((result) => (
                <div key={result.id} className="rounded-2xl border border-border/80 bg-white/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{result.quiz.title}</p>
                      <p className="mt-1 text-sm text-slate-600">Submitted {formatDate(result.submittedAt, "dd MMM yyyy, hh:mm a")}</p>
                    </div>
                    <Badge value={`${result.score}/${result.totalQuestions}`} tone="emerald" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Homework updates</CardTitle>
          <CardDescription>Your latest homework tasks, uploads, and marked results.</CardDescription>
        </CardHeader>
        <CardContent>
          {latestHomework.length === 0 ? (
            <EmptyState title="No homework yet" description="Homework assigned by your teacher will appear here and under the homework tab." />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {latestHomework.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-border/80 bg-white/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{entry.homework.title}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {entry.homework.class.title} • Due {formatDate(entry.homework.deadline)}
                      </p>
                    </div>
                    <Badge value={entry.status} tone={entry.status === "REVIEWED" ? "emerald" : entry.status === "SUBMITTED" ? "sky" : "amber"} />
                  </div>
                  {entry.score !== null && entry.score !== undefined ? (
                    <p className="mt-3 text-sm font-semibold text-brand-700">
                      Result: {entry.score}
                      {entry.maxScore ? ` / ${entry.maxScore}` : ""}
                    </p>
                  ) : null}
                  {entry.feedback ? <p className="mt-2 text-sm leading-6 text-slate-600">{entry.feedback}</p> : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

