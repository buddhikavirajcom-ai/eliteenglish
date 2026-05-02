import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { quizSchema } from "@/lib/validators";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const quizzes = await prisma.quiz.findMany({
    where: session.user.role === "ADMIN" ? undefined : { isPublished: true },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      questions: true,
      results: session.user.role === "ADMIN" ? true : { where: { studentId: session.user.studentId ?? "" } }
    }
  });

  return NextResponse.json(quizzes);
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
    const parsed = quizSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload." }, { status: 400 });
    }

    const quiz = await prisma.quiz.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        createdById: session.user.id,
        questions: {
          create: parsed.data.questions.map((question) => ({
            prompt: question.prompt,
            options: question.options,
            correctAnswer: question.correctAnswer
          }))
        }
      }
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create quiz." }, { status: 500 });
  }
}
