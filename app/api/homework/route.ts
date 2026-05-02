import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { homeworkUploadExtensions } from "@/lib/file-types";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile, UploadValidationError } from "@/lib/uploads";
import { homeworkCreateSchema } from "@/lib/validators";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

function dateOnly(value: string) {
  return new Date(`${value}T00:00:00`);
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return unauthorized();
  }

  if (session.user.role === "ADMIN") {
    const homework = await prisma.homework.findMany({
      orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
      include: {
        class: true,
        submissions: {
          include: {
            student: true
          },
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });

    return NextResponse.json(homework);
  }

  const submissions = await prisma.homeworkSubmission.findMany({
    where: {
      studentId: session.user.studentId ?? ""
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      student: true,
      homework: {
        include: {
          class: true
        }
      }
    }
  });

  return NextResponse.json(submissions);
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
    const formData = await request.formData();
    const payload = {
      classId: String(formData.get("classId") ?? ""),
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      deadline: String(formData.get("deadline") ?? "")
    };

    const parsed = homeworkCreateSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid payload.",
          fieldErrors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const targetClass = await prisma.class.findUnique({
      where: {
        id: parsed.data.classId
      },
      include: {
        enrollments: true
      }
    });

    if (!targetClass) {
      return NextResponse.json({ error: "Class not found.", fieldErrors: { classId: ["Select a valid class."] } }, { status: 404 });
    }

    const attachment = formData.get("attachment");
    let uploadedFile: { fileName: string; url: string } | null = null;

    if (attachment instanceof File && attachment.size > 0) {
      uploadedFile = await saveUploadedFile(attachment, "homework", {
        allowedExtensions: homeworkUploadExtensions
      });
    }

    const homework = await prisma.homework.create({
      data: {
        classId: parsed.data.classId,
        title: parsed.data.title,
        description: parsed.data.description,
        deadline: dateOnly(parsed.data.deadline),
        attachmentName: uploadedFile?.fileName,
        attachmentUrl: uploadedFile?.url,
        createdById: session.user.id,
        submissions: targetClass.enrollments.length
          ? {
              createMany: {
                data: targetClass.enrollments.map((enrollment) => ({
                  studentId: enrollment.studentId
                }))
              }
            }
          : undefined
      },
      include: {
        class: true,
        submissions: {
          include: {
            student: true
          }
        }
      }
    });

    return NextResponse.json(homework, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to create homework."
      },
      { status: error instanceof UploadValidationError ? 400 : 500 }
    );
  }
}
