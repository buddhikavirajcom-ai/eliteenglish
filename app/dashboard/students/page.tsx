import QRCode from "qrcode";
import { Header } from "@/components/layout/header";
import { StudentManager } from "@/components/students/student-manager";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { StudentItem } from "@/types/lms";

export default async function StudentsPage() {
  await requireAdmin();

  const studentsRaw = await prisma.student.findMany({
    orderBy: {
      createdAt: "desc"
    },
    include: {
      user: true,
      attendances: true,
      payments: true,
      enrollments: true,
      progressEntries: {
        orderBy: {
          month: "desc"
        },
        take: 1
      }
    }
  });

  const students: StudentItem[] = await Promise.all(
    studentsRaw.map(async (student) => ({
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
    }))
  );

  return (
    <div className="space-y-8">
      <Header
        title="Students"
        subtitle="Dashboard"
        description="Open full student details in one popup, manage portal access, and keep the page simple for everyday use."
      />
      <StudentManager initialStudents={students} />
    </div>
  );
}
