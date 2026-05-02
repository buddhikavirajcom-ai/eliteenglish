import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { classInclude, createClassData, validateClassReferences } from "@/lib/classes";
import { prisma } from "@/lib/prisma";
import { classSchema } from "@/lib/validators";

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

  const classes = await prisma.class.findMany({
    where:
      session.user.role === "ADMIN"
        ? undefined
        : {
            enrollments: {
              some: {
                studentId: session.user.studentId ?? ""
              }
            }
          },
    orderBy: [{ date: "asc" }, { time: "asc" }],
    include: classInclude
  });

  return NextResponse.json(classes);
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

    const lesson = await prisma.class.create({
      data: createClassData(parsed.data, session.user.id),
      include: classInclude
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create class." }, { status: 500 });
  }
}

