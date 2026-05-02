import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateStudentSchema } from "@/lib/validators";

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

  if (session.user.role !== "ADMIN") {
    return forbidden();
  }

  const student = await prisma.student.findUnique({
    where: {
      id: params.id
    },
    include: {
      user: true,
      attendances: true,
      payments: true,
      enrollments: {
        include: {
          class: {
            include: {
              teacher: true,
              enrollments: {
                include: {
                  student: true
                }
              }
            }
          }
        }
      },
      progressEntries: {
        orderBy: {
          month: "desc"
        }
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
      }
    }
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  return NextResponse.json(student);
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
    const body = await request.json();
    const parsed = updateStudentSchema.safeParse(body);

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
        id: params.id
      }
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    const normalizedEmail = parsed.data.email?.toLowerCase();

    const duplicateUser = await prisma.user.findFirst({
      where: {
        NOT: {
          id: student.userId
        },
        OR: [
          { phone: parsed.data.phone },
          ...(normalizedEmail ? [{ email: normalizedEmail }] : [])
        ]
      }
    });

    if (duplicateUser) {
      return NextResponse.json(
        {
          error: normalizedEmail && duplicateUser.email === normalizedEmail ? "Another user already uses this email address." : "Another user already uses this phone number.",
          fieldErrors:
            normalizedEmail && duplicateUser.email === normalizedEmail
              ? { email: ["Use a different email address."] }
              : { phone: ["Use a different phone number."] }
        },
        { status: 409 }
      );
    }

    const passwordHash = parsed.data.password ? await bcrypt.hash(parsed.data.password, 10) : null;

    const updated = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: student.userId
        },
        data: {
          name: parsed.data.name,
          email: normalizedEmail ?? null,
          phone: parsed.data.phone,
          ...(passwordHash ? { passwordHash } : {})
        }
      });

      return tx.student.update({
        where: {
          id: params.id
        },
        data: {
          name: parsed.data.name,
          phone: parsed.data.phone,
          parentName: parsed.data.parentName,
          parentContact: parsed.data.parentContact,
          grade: parsed.data.grade,
          school: parsed.data.school,
          learningLevel: parsed.data.learningLevel,
          notes: parsed.data.notes
        },
        include: {
          user: true
        }
      });
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Unable to update student." }, { status: 500 });
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

  const student = await prisma.student.findUnique({
    where: {
      id: params.id
    }
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  await prisma.user.delete({
    where: {
      id: student.userId
    }
  });

  return NextResponse.json({ message: "Student deleted successfully." });
}