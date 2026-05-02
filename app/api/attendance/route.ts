import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { attendanceSchema } from "@/lib/validators";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function dateOnly(value: string) {
  return new Date(`${value}T00:00:00`);
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return unauthorized();
  }

  const records = await prisma.attendance.findMany({
    where: session.user.role === "ADMIN" ? undefined : { studentId: session.user.studentId ?? "" },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: {
      student: true
    }
  });

  return NextResponse.json(records);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return unauthorized();
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = attendanceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload." }, { status: 400 });
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        studentId_date: {
          studentId: parsed.data.studentId,
          date: dateOnly(parsed.data.date)
        }
      },
      create: {
        studentId: parsed.data.studentId,
        date: dateOnly(parsed.data.date),
        status: parsed.data.status
      },
      update: {
        status: parsed.data.status
      }
    });

    return NextResponse.json(attendance);
  } catch {
    return NextResponse.json({ error: "Unable to save attendance." }, { status: 500 });
  }
}
