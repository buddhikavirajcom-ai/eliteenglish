import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { classInclude, updateClassData, validateClassReferences } from "@/lib/classes";
import { prisma } from "@/lib/prisma";
import { classSchema } from "@/lib/validators";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return unauthorized();
  }

  const lesson = await prisma.class.findUnique({
    where: {
      id: params.id
    },
    include: classInclude
  });

  if (!lesson) {
    return NextResponse.json({ error: "Class not found." }, { status: 404 });
  }

  if (
    session.user.role !== "ADMIN" &&
    !lesson.enrollments.some((enrollment) => enrollment.studentId === (session.user.studentId ?? ""))
  ) {
    return forbidden();
  }

  return NextResponse.json(lesson);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return unauthorized();
  }

  if (session.user.role !== "ADMIN") {
    return forbidden();
  }

  try {
    const existing = await prisma.class.findUnique({
      where: {
        id: params.id
      }
    });

    if (!existing) {
      return NextResponse.json({ error: "Class not found." }, { status: 404 });
    }

    const body = await request.json();
    const parsed = classSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid payload.",
          fieldErrors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const referenceError = await validateClassReferences(parsed.data);

    if (referenceError) {
      return NextResponse.json(referenceError, { status: 400 });
    }

    const lesson = await prisma.class.update({
      where: {
        id: params.id
      },
      data: updateClassData(parsed.data),
      include: classInclude
    });

    return NextResponse.json(lesson);
  } catch {
    return NextResponse.json({ error: "Unable to update class." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return unauthorized();
  }

  if (session.user.role !== "ADMIN") {
    return forbidden();
  }

  const existing = await prisma.class.findUnique({
    where: {
      id: params.id
    }
  });

  if (!existing) {
    return NextResponse.json({ error: "Class not found." }, { status: 404 });
  }

  await prisma.class.delete({
    where: {
      id: params.id
    }
  });

  return NextResponse.json({ message: "Class deleted successfully." });
}

