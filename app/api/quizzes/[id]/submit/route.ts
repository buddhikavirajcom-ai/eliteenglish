import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { quizSubmissionSchema } from "@/lib/validators";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "STUDENT" || !session.user.studentId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = quizSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload." }, { status: 400 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: {
        id: params.id
      },
      include: {
        questions: {
          orderBy: {
            createdAt: "asc"
          }
        },
        results: {
          where: {
            studentId: session.user.studentId
          }
        }
      }
    });

    if (!quiz || !quiz.isPublished) {
      return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
    }

    if (quiz.results.length > 0) {
      return NextResponse.json({ error: "Quiz already submitted." }, { status: 409 });
    }

    if (parsed.data.answers.length !== quiz.questions.length) {
      return NextResponse.json({ error: "Answer count does not match question count." }, { status: 400 });
    }

    const score = quiz.questions.reduce((sum, question, index) => {
      return sum + (parsed.data.answers[index] === question.correctAnswer ? 1 : 0);
    }, 0);

    const result = await prisma.result.create({
      data: {
        quizId: quiz.id,
        studentId: session.user.studentId,
        answers: parsed.data.answers,
        score,
        totalQuestions: quiz.questions.length
      }
    });

    return NextResponse.json({
      id: result.id,
      score: result.score,
      totalQuestions: result.totalQuestions,
      message: "Quiz submitted successfully."
    });
  } catch {
    return NextResponse.json({ error: "Unable to submit quiz." }, { status: 500 });
  }
}
