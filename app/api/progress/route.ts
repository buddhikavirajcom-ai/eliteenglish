import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { progressSchema } from "@/lib/validators";

function monthToDate(value: string) {
  return new Date(`${value}-01T00:00:00`);
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return unauthorized();
  }

  const entries = await prisma.progressEntry.findMany({
    where: session.user.role === "ADMIN" ? undefined : { studentId: session.user.studentId ?? "" },
    orderBy: [{ month: "desc" }, { createdAt: "desc" }],
    include: {
      student: true
    }
  });

  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return unauthorized();
  }

  if (session.user.role !== "ADMIN") {
    return forbidden();
  }

  try {
    const body = await request.json();
    const parsed = progressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid payload.",
          fieldErrors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: {
        id: parsed.data.studentId
      },
      select: {
        id: true
      }
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found.", fieldErrors: { studentId: ["Select a valid student."] } }, { status: 404 });
    }

    const entry = await prisma.progressEntry.upsert({
      where: {
        studentId_month: {
          studentId: parsed.data.studentId,
          month: monthToDate(parsed.data.month)
        }
      },
      create: {
        studentId: parsed.data.studentId,
        month: monthToDate(parsed.data.month),
        listening: parsed.data.listening,
        reading: parsed.data.reading,
        writing: parsed.data.writing,
        speaking: parsed.data.speaking,
        comment: parsed.data.comment,
        testMark: parsed.data.testMark,
        createdById: session.user.id
      },
      update: {
        listening: parsed.data.listening,
        reading: parsed.data.reading,
        writing: parsed.data.writing,
        speaking: parsed.data.speaking,
        comment: parsed.data.comment,
        testMark: parsed.data.testMark,
        createdById: session.user.id
      },
      include: {
        student: true
      }
    });

    return NextResponse.json(entry);
  } catch {
    return NextResponse.json({ error: "Unable to save progress." }, { status: 500 });
  }
}