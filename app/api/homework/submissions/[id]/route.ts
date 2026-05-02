import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { homeworkUploadExtensions } from "@/lib/file-types";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile, UploadValidationError } from "@/lib/uploads";
import { homeworkReviewSchema } from "@/lib/validators";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return unauthorized();
  }

  const submission = await prisma.homeworkSubmission.findUnique({
    where: {
      id: params.id
    }
  });

  if (!submission) {
    return NextResponse.json({ error: "Homework submission not found." }, { status: 404 });
  }

  if (session.user.role === "ADMIN") {
    try {
      const body = await request.json();
      const parsed = homeworkReviewSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          {
            error: parsed.error.issues[0]?.message ?? "Invalid payload.",
            fieldErrors: parsed.error.flatten().fieldErrors
          },
          { status: 400 }
        );
      }

      const updated = await prisma.homeworkSubmission.update({
        where: {
          id: params.id
        },
        data: {
          feedback: parsed.data.feedback,
          score: parsed.data.score,
          maxScore: parsed.data.maxScore,
          status: parsed.data.status ?? "REVIEWED",
          reviewedAt: new Date()
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

      return NextResponse.json(updated);
    } catch {
      return NextResponse.json({ error: "Unable to review homework." }, { status: 500 });
    }
  }

  if (submission.studentId !== (session.user.studentId ?? "")) {
    return forbidden();
  }

  try {
    const formData = await request.formData();
    const answer = formData.get("answer");

    if (!(answer instanceof File) || answer.size === 0) {
      return NextResponse.json({ error: "Upload a file before submitting." }, { status: 400 });
    }

    const uploaded = await saveUploadedFile(answer, "homework-submissions", {
      allowedExtensions: homeworkUploadExtensions
    });

    const updated = await prisma.homeworkSubmission.update({
      where: {
        id: params.id
      },
      data: {
        responseName: uploaded.fileName,
        responseUrl: uploaded.url,
        status: "SUBMITTED",
        submittedAt: new Date(),
        reviewedAt: null,
        feedback: null,
        score: null,
        maxScore: null
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

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to submit homework."
      },
      { status: error instanceof UploadValidationError ? 400 : 500 }
    );
  }
}
