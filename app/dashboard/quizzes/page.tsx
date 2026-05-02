import { Header } from "@/components/layout/header";
import { QuizManager } from "@/components/quizzes/quiz-manager";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { QuizItem, QuizResultItem } from "@/types/lms";

export default async function QuizzesPage() {
  const user = await requireAuth();

  if (user.role === "ADMIN") {
    const quizzes = await prisma.quiz.findMany({
      orderBy: {
        createdAt: "desc"
      },
      include: {
        questions: true,
        results: {
          include: {
            student: true
          },
          orderBy: {
            submittedAt: "desc"
          }
        }
      }
    });

    const quizItems: QuizItem[] = quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      createdAt: quiz.createdAt.toISOString(),
      questionCount: quiz.questions.length,
      attemptCount: quiz.results.length,
      averageScore:
        quiz.results.length === 0
          ? 0
          : (quiz.results.reduce((sum, result) => sum + result.score / Math.max(result.totalQuestions, 1), 0) / quiz.results.length) * 100,
      results: quiz.results.map(
        (result): QuizResultItem => ({
          studentId: result.studentId,
          studentName: result.student.name,
          score: result.score,
          totalQuestions: result.totalQuestions,
          percentage: Math.round((result.score / Math.max(result.totalQuestions, 1)) * 100),
          submittedAt: result.submittedAt.toISOString()
        })
      )
    }));

    return (
      <div className="space-y-8">
        <Header
          title="Quizzes"
          subtitle="Admin"
          description="Create assessments, monitor attempt volume, and review average performance across the current quiz library."
        />
        <QuizManager isAdmin quizzes={quizItems} />
      </div>
    );
  }

  const quizzes = await prisma.quiz.findMany({
    where: {
      isPublished: true
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      questions: true,
      results: {
        where: {
          studentId: user.studentId ?? ""
        }
      }
    }
  });

  const quizItems: QuizItem[] = quizzes.map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    createdAt: quiz.createdAt.toISOString(),
    questionCount: quiz.questions.length,
    attemptCount: quiz.results.length,
    averageScore: 0,
    result: quiz.results[0]
      ? {
          studentId: user.studentId ?? "",
          studentName: user.name ?? "Student",
          score: quiz.results[0].score,
          totalQuestions: quiz.results[0].totalQuestions,
          percentage: Math.round((quiz.results[0].score / Math.max(quiz.results[0].totalQuestions, 1)) * 100),
          submittedAt: quiz.results[0].submittedAt.toISOString()
        }
      : null
  }));

  return (
    <div className="space-y-8">
      <Header
        title="My Quizzes"
        subtitle="Student"
        description="Attempt published quizzes, review previous scores, and keep your progress visible at a glance."
      />
      <QuizManager isAdmin={false} quizzes={quizItems} />
    </div>
  );
}

