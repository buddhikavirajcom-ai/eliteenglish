import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { qrScanSchema } from "@/lib/validators";

function dateOnly(value: string) {
  return new Date(`${value}T00:00:00`);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = qrScanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload." }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: {
        qrCode: parsed.data.qrCode
      }
    });

    if (!student) {
      return NextResponse.json({ error: "QR code not recognized." }, { status: 404 });
    }

    const attendanceDate = parsed.data.date ? dateOnly(parsed.data.date) : dateOnly(new Date().toISOString().slice(0, 10));

    await prisma.attendance.upsert({
      where: {
        studentId_date: {
          studentId: student.id,
          date: attendanceDate
        }
      },
      create: {
        studentId: student.id,
        date: attendanceDate,
        status: "PRESENT"
      },
      update: {
        status: "PRESENT"
      }
    });

    return NextResponse.json({
      message: `${student.name} marked present successfully.`
    });
  } catch {
    return NextResponse.json({ error: "Unable to process QR scan." }, { status: 500 });
  }
}
