import { ClassManager } from "@/components/classes/class-manager";
import { Header } from "@/components/layout/header";
import { requireAuth } from "@/lib/auth";
import { classInclude } from "@/lib/classes";
import { enrollmentRequestInclude } from "@/lib/enrollment-requests";
import { prisma } from "@/lib/prisma";
import type { ClassEnrollmentRequestItem, ClassItem, StudentOption, TeacherOption } from "@/types/lms";

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

function mapEnrollmentRequestItem(
  request: Awaited<ReturnType<typeof prisma.classEnrollmentRequest.findFirst>> & {
    class: {
      id: string;
      title: string;
      subject: string;
      level: string;
      fee: { toString(): string } | number;
      date: Date;
      scheduleDay: ClassItem["scheduleDay"];
      time: string;
      endTime: string;
    };
  }
) {
  return {
    id: request.id,
    classId: request.class.id,
    className: request.class.title,
    classSubject: request.class.subject,
    classLevel: request.class.level,
    classFee: Number(request.class.fee),
    classDate: request.class.date.toISOString(),
    scheduleDay: request.class.scheduleDay,
    startTime: request.class.time,
    endTime: request.class.endTime,
    studentName: request.studentName,
    studentPhone: request.studentPhone,
    studentEmail: request.studentEmail,
    parentName: request.parentName,
    parentContact: request.parentContact,
    grade: request.grade,
    school: request.school,
    learningLevel: request.learningLevel,
    notes: request.notes,
    status: request.status,
    paymentSlipName: request.paymentSlipName,
    paymentSlipUrl: request.paymentSlipUrl,
    reviewNote: request.reviewNote,
    approvedStudentId: request.approvedStudentId,
    createdAt: request.createdAt.toISOString(),
    reviewedAt: request.reviewedAt?.toISOString() ?? null,
    approvedAt: request.approvedAt?.toISOString() ?? null
  } satisfies ClassEnrollmentRequestItem;
}

export default async function ClassesPage() {
  const user = await requireAuth();

  if (user.role === "ADMIN") {
    const [teachers, students, classes, enrollmentRequests] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: "ADMIN"
        },
        orderBy: {
          name: "asc"
        }
      }),
      prisma.student.findMany({
        orderBy: {
          name: "asc"
        }
      }),
      prisma.class.findMany({
        orderBy: [{ date: "asc" }, { time: "asc" }],
        include: classInclude
      }),
      prisma.classEnrollmentRequest.findMany({
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        include: enrollmentRequestInclude
      })
    ]);

    const teacherOptions: TeacherOption[] = teachers.map((teacher) => ({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone
    }));

    const studentOptions: StudentOption[] = students.map((student) => ({
      id: student.id,
      name: student.name,
      phone: student.phone,
      qrCode: student.qrCode
    }));

    const classItems: ClassItem[] = classes.map((lesson) => mapClassItem(lesson as never));
    const enrollmentRequestItems: ClassEnrollmentRequestItem[] = enrollmentRequests.map((request) => mapEnrollmentRequestItem(request as never));

    return (
      <div className="space-y-8">
        <Header
          title="Class Management"
          subtitle="Admin"
          description="Create polished class schedules, assign students, review online enrollments, and keep teacher, fee, and delivery details in one reliable flow."
        />
        <ClassManager classes={classItems} enrollmentRequests={enrollmentRequestItems} isAdmin students={studentOptions} teachers={teacherOptions} />
      </div>
    );
  }

  const classes = await prisma.class.findMany({
    where: {
      enrollments: {
        some: {
          studentId: user.studentId ?? ""
        }
      }
    },
    orderBy: [{ date: "asc" }, { time: "asc" }],
    include: classInclude
  });

  const classItems: ClassItem[] = classes.map((lesson) => mapClassItem(lesson as never));

  return (
    <div className="space-y-8">
      <Header
        title="My Classes"
        subtitle="Student"
        description="Review your upcoming sessions, joining details, and schedule information from one clean dashboard view."
      />
      <ClassManager classes={classItems} enrollmentRequests={[]} isAdmin={false} students={[]} teachers={[]} />
    </div>
  );
}