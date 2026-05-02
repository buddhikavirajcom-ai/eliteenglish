import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { StudentProfileView } from "@/components/students/student-profile-view";
import { classInclude } from "@/lib/classes";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ClassItem, StudentProfile } from "@/types/lms";

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

export default async function StudentProfilePage({ params }: { params: { id: string } }) {
  await requireAdmin();

  const student = await prisma.student.findUnique({
    where: {
      id: params.id
    },
    include: {
      user: true,
      attendances: {
        orderBy: [{ date: "desc" }, { createdAt: "desc" }]
      },
      payments: {
        orderBy: [{ date: "desc" }, { createdAt: "desc" }]
      },
      progressEntries: {
        orderBy: [{ month: "desc" }, { createdAt: "desc" }]
      },
      homeworkEntries: {
        include: {
          homework: {
            include: {
              class: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      },
      enrollments: {
        include: {
          class: {
            include: classInclude
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });

  if (!student) {
    notFound();
  }

  const profile: StudentProfile = {
    student: {
      id: student.id,
      name: student.name,
      phone: student.phone,
      email: student.user.email,
      parentName: student.parentName,
      parentContact: student.parentContact,
      grade: student.grade,
      school: student.school,
      learningLevel: student.learningLevel,
      notes: student.notes,
      qrCode: student.qrCode,
      qrPreview: await QRCode.toDataURL(student.qrCode),
      createdAt: student.createdAt.toISOString(),
      attendanceCount: student.attendances.length,
      paidTotal: student.payments.filter((item) => item.status === "PAID").reduce((sum, item) => sum + Number(item.amount), 0),
      pendingTotal: student.payments.filter((item) => item.status === "PENDING").reduce((sum, item) => sum + Number(item.amount), 0),
      classCount: student.enrollments.length,
      latestProgressMonth: student.progressEntries[0]?.month.toISOString() ?? null
    },
    classes: student.enrollments.map((enrollment) => mapClassItem(enrollment.class as never)),
    progress: student.progressEntries.map((entry) => ({
      id: entry.id,
      studentId: entry.studentId,
      studentName: student.name,
      month: entry.month.toISOString().slice(0, 7),
      listening: entry.listening,
      reading: entry.reading,
      writing: entry.writing,
      speaking: entry.speaking,
      comment: entry.comment,
      testMark: entry.testMark,
      createdAt: entry.createdAt.toISOString()
    })),
    homework: student.homeworkEntries.map((entry) => ({
      id: entry.homework.id,
      title: entry.homework.title,
      description: entry.homework.description,
      deadline: entry.homework.deadline.toISOString(),
      attachmentName: entry.homework.attachmentName,
      attachmentUrl: entry.homework.attachmentUrl,
      classId: entry.homework.classId,
      className: entry.homework.class.title,
      createdAt: entry.homework.createdAt.toISOString(),
      submissions: [
        {
          id: entry.id,
          studentId: entry.studentId,
          studentName: student.name,
          status: entry.status,
          responseName: entry.responseName,
          responseUrl: entry.responseUrl,
          score: entry.score,
          maxScore: entry.maxScore,
          feedback: entry.feedback,
          submittedAt: entry.submittedAt?.toISOString() ?? null,
          reviewedAt: entry.reviewedAt?.toISOString() ?? null
        }
      ]
    })),
    attendance: student.attendances.map((record) => ({
      id: record.id,
      studentId: record.studentId,
      studentName: student.name,
      date: record.date.toISOString(),
      status: record.status,
      createdAt: record.createdAt.toISOString()
    })),
    payments: student.payments.map((payment) => ({
      id: payment.id,
      studentId: payment.studentId,
      studentName: student.name,
      amount: Number(payment.amount),
      type: payment.type,
      method: payment.method,
      status: payment.status,
      date: payment.date.toISOString()
    }))
  };

  return (
    <div className="space-y-8">
      <Header
        title={student.name}
        subtitle="Student Profile"
        description="Review the learner's progress, timetable, homework, attendance, and payment context from one page."
      />
      <StudentProfileView profile={profile} />
    </div>
  );
}
