import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createStudentSchema } from "@/lib/validators";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

function createQrCode(name: string) {
  return `LMS-${name.replace(/\s+/g, "-").toUpperCase()}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return unauthorized();
  }

  if (session.user.role !== "ADMIN") {
    return forbidden();
  }

  const students = await prisma.student.findMany({
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

  return NextResponse.json(students);
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
    const parsed = createStudentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid payload.",
          fieldErrors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const normalizedEmail = parsed.data.email?.toLowerCase();

    const duplicateUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: parsed.data.phone },
          ...(normalizedEmail ? [{ email: normalizedEmail }] : [])
        ]
      }
    });

    if (duplicateUser) {
      return NextResponse.json(
        {
          error: normalizedEmail && duplicateUser.email === normalizedEmail ? "A user with this email already exists." : "A user with this phone already exists.",
          fieldErrors:
            normalizedEmail && duplicateUser.email === normalizedEmail
              ? { email: ["Use a different email address."] }
              : { phone: ["Use a different phone number."] }
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);

    const student = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: parsed.data.name,
          email: normalizedEmail,
          phone: parsed.data.phone,
          passwordHash,
          role: "STUDENT"
        }
      });

      return tx.student.create({
        data: {
          name: parsed.data.name,
          phone: parsed.data.phone,
          parentName: parsed.data.parentName,
          parentContact: parsed.data.parentContact,
          grade: parsed.data.grade,
          school: parsed.data.school,
          learningLevel: parsed.data.learningLevel,
          notes: parsed.data.notes,
          qrCode: createQrCode(parsed.data.name),
          userId: user.id
        },
        include: {
          user: true
        }
      });
    });

    return NextResponse.json(student, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create student." }, { status: 500 });
  }
}