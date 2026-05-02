import { Header } from "@/components/layout/header";
import { ProgressManager } from "@/components/progress/progress-manager";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ProgressItem, StudentOption } from "@/types/lms";

export default async function ProgressPage({ searchParams }: { searchParams?: { studentId?: string } }) {
  const user = await requireAuth();

  if (user.role === "ADMIN") {
    const [studentsRaw, entriesRaw] = await Promise.all([
      prisma.student.findMany({
        orderBy: {
          name: "asc"
        },
        include: {
          user: {
            select: {
              email: true
            }
          }
        }
      }),
      prisma.progressEntry.findMany({
        orderBy: [{ month: "desc" }, { createdAt: "desc" }],
        include: {
          student: true
        }
      })
    ]);

    const students: StudentOption[] = studentsRaw.map((student) => ({
      id: student.id,
      name: student.name,
      phone: student.phone,
      email: student.user.email,
      qrCode: student.qrCode
    }));

    const entries: ProgressItem[] = entriesRaw.map((entry) => ({
      id: entry.id,
      studentId: entry.studentId,
      studentName: entry.student.name,
      month: entry.month.toISOString().slice(0, 7),
      listening: entry.listening,
      reading: entry.reading,
      writing: entry.writing,
      speaking: entry.speaking,
      comment: entry.comment,
      testMark: entry.testMark,
      createdAt: entry.createdAt.toISOString()
    }));

    return (
      <div className="space-y-8">
        <Header
          title="Progress Tracking"
          subtitle="Admin"
          description="Update monthly English progress in one short form and keep a clear history for parents."
        />
        <ProgressManager entries={entries} students={students} isAdmin initialStudentId={searchParams?.studentId} />
      </div>
    );
  }

  const entriesRaw = await prisma.progressEntry.findMany({
    where: {
      studentId: user.studentId ?? ""
    },
    orderBy: [{ month: "desc" }, { createdAt: "desc" }],
    include: {
      student: true
    }
  });

  const entries: ProgressItem[] = entriesRaw.map((entry) => ({
    id: entry.id,
    studentId: entry.studentId,
    studentName: entry.student.name,
    month: entry.month.toISOString().slice(0, 7),
    listening: entry.listening,
    reading: entry.reading,
    writing: entry.writing,
    speaking: entry.speaking,
    comment: entry.comment,
    testMark: entry.testMark,
    createdAt: entry.createdAt.toISOString()
  }));

  return (
    <div className="space-y-8">
      <Header
        title="My Progress"
        subtitle="Student"
        description="Review the latest monthly progress updates, comments, and test marks in one simple place."
      />
      <ProgressManager entries={entries} students={[]} isAdmin={false} />
    </div>
  );
}