import { z } from "zod";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const assignmentSchema = z.object({
  studentIds: z.array(z.string()).default([])
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = assignmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload." }, { status: 400 });
    }

    const lesson = await prisma.class.findUnique({
      where: {
        id: params.id
      }
    });

    if (!lesson) {
      return NextResponse.json({ error: "Class not found." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.classEnrollment.deleteMany({
        where: {
          classId: params.id
        }
      });

      if (parsed.data.studentIds.length > 0) {
        await tx.classEnrollment.createMany({
          data: parsed.data.studentIds.map((studentId) => ({
            classId: params.id,
            studentId
          }))
        });
      }
    });

    return NextResponse.json({ message: "Class assignments updated." });
  } catch {
    return NextResponse.json({ error: "Unable to update class assignments." }, { status: 500 });
  }
}
