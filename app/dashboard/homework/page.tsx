import { Header } from "@/components/layout/header";
import { HomeworkManager } from "@/components/homework/homework-manager";
import { classInclude } from "@/lib/classes";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ClassItem, HomeworkItem } from "@/types/lms";

function mapClassItem(lesson: Awaited<ReturnType<typeof prisma.class.findFirst>> & { enrollments: { studentId: string; student: { id: string; name: string; phone: string; qrCode: string } }[]; teacher: { id: string; name: string; email: string | null; phone: string | null } }) {
  return {
    id: lesson.id,
    title: lesson.title,
    subject: lesson.subject,
    level: lesson.level,
    type: lesson.type,
    status: lesson.status,
    date: lesson.date.toISOString(),
    scheduleDay: lesson.scheduleDay,
    startTime: lesson.time,
    endTime: lesson.endTime,
    meetingLink: lesson.link,
    location: lesson.location,
    capacity: lesson.capacity,
    fee: Number(lesson.fee),
    notes: lesson.notes,
    teacher: {
      id: lesson.teacher.id,
      name: lesson.teacher.name,
      email: lesson.teacher.email,
      phone: lesson.teacher.phone
    },
    studentIds: lesson.enrollments.map((enrollment) => enrollment.studentId),
    students: lesson.enrollments.map((enrollment) => ({
      id: enrollment.student.id,
      name: enrollment.student.name,
      phone: enrollment.student.phone,
      qrCode: enrollment.student.qrCode
    }))
  } satisfies ClassItem;
}

export default async function HomeworkPage() {
  const user = await requireAuth();

  if (user.role === "ADMIN") {
    const [classesRaw, homeworkRaw] = await Promise.all([
      prisma.class.findMany({
        orderBy: [{ date: "asc" }, { time: "asc" }],
        include: classInclude
      }),
      prisma.homework.findMany({
        orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
        include: {
          class: true,
          submissions: {
            include: {
              student: true
            },
            orderBy: {
              createdAt: "asc"
            }
          }
        }
      })
    ]);

    const classes: ClassItem[] = classesRaw.map((lesson) => mapClassItem(lesson as never));
    const homework: HomeworkItem[] = homeworkRaw.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      deadline: item.deadline.toISOString(),
      attachmentName: item.attachmentName,
      attachmentUrl: item.attachmentUrl,
      classId: item.classId,
      className: item.class.title,
      createdAt: item.createdAt.toISOString(),
      submissions: item.submissions.map((submission) => ({
        id: submission.id,
        studentId: submission.studentId,
        studentName: submission.student.name,
        status: submission.status,
        responseName: submission.responseName,
        responseUrl: submission.responseUrl,
        score: submission.score,
        maxScore: submission.maxScore,
        feedback: submission.feedback,
        submittedAt: submission.submittedAt?.toISOString() ?? null,
        reviewedAt: submission.reviewedAt?.toISOString() ?? null
      }))
    }));

    return (
      <div className="space-y-8">
        <Header
          title="Homework"
          subtitle="Admin"
          description="Add new homework, review submissions, and share simple feedback without leaving the dashboard."
        />
        <HomeworkManager homework={homework} classes={classes} isAdmin />
      </div>
    );
  }

  const submissionsRaw = await prisma.homeworkSubmission.findMany({
    where: {
      studentId: user.studentId ?? ""
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      student: true,
      homework: {
        include: {
          class: true
        }
      }
    }
  });

  const homework: HomeworkItem[] = submissionsRaw.map((submission) => ({
    id: submission.homework.id,
    title: submission.homework.title,
    description: submission.homework.description,
    deadline: submission.homework.deadline.toISOString(),
    attachmentName: submission.homework.attachmentName,
    attachmentUrl: submission.homework.attachmentUrl,
    classId: submission.homework.classId,
    className: submission.homework.class.title,
    createdAt: submission.homework.createdAt.toISOString(),
    submissions: [
      {
        id: submission.id,
        studentId: submission.studentId,
        studentName: submission.student.name,
        status: submission.status,
        responseName: submission.responseName,
        responseUrl: submission.responseUrl,
        score: submission.score,
        maxScore: submission.maxScore,
        feedback: submission.feedback,
        submittedAt: submission.submittedAt?.toISOString() ?? null,
        reviewedAt: submission.reviewedAt?.toISOString() ?? null
      }
    ]
  }));

  return (
    <div className="space-y-8">
      <Header
        title="My Homework"
        subtitle="Student"
        description="See homework, upload answers, and read teacher feedback in one place."
      />
      <HomeworkManager homework={homework} classes={[]} isAdmin={false} />
    </div>
  );
}
