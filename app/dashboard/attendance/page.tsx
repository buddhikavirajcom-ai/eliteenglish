import { Header } from "@/components/layout/header";
import { AttendanceManager } from "@/components/attendance/attendance-manager";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AttendanceItem, StudentOption } from "@/types/lms";

export default async function AttendancePage() {
  const user = await requireAuth();

  if (user.role === "ADMIN") {
    const [students, records] = await Promise.all([
      prisma.student.findMany({
        orderBy: {
          name: "asc"
        }
      }),
      prisma.attendance.findMany({
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        include: {
          student: true
        }
      })
    ]);

    const studentOptions: StudentOption[] = students.map((student) => ({
      id: student.id,
      name: student.name,
      phone: student.phone,
      qrCode: student.qrCode
    }));

    const attendanceRecords: AttendanceItem[] = records.map((record) => ({
      id: record.id,
      studentId: record.studentId,
      studentName: record.student.name,
      date: record.date.toISOString(),
      status: record.status,
      createdAt: record.createdAt.toISOString()
    }));

    return (
      <div className="space-y-8">
        <Header
          title="Attendance"
          subtitle="Admin"
          description="Record attendance manually or by QR code and keep the history readable for day-to-day classroom operations."
        />
        <AttendanceManager isAdmin records={attendanceRecords} students={studentOptions} />
      </div>
    );
  }

  const records = await prisma.attendance.findMany({
    where: {
      studentId: user.studentId ?? ""
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: {
      student: true
    }
  });

  const attendanceRecords: AttendanceItem[] = records.map((record) => ({
    id: record.id,
    studentId: record.studentId,
    studentName: record.student.name,
    date: record.date.toISOString(),
    status: record.status,
    createdAt: record.createdAt.toISOString()
  }));

  return (
    <div className="space-y-8">
      <Header
        title="My Attendance"
        subtitle="Student"
        description="Track your attendance history and stay aware of every recorded present or absent session."
      />
      <AttendanceManager isAdmin={false} records={attendanceRecords} students={[]} />
    </div>
  );
}

