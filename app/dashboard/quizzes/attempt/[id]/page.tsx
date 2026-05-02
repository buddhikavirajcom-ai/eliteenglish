import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizAttempt } from "@/components/quizzes/quiz-attempt";
import { requireStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { QuestionItem } from "@/types/lms";

export default async function QuizAttemptPage({ params }: { params: { id: string } }) {
  const user = await requireStudent();

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
          studentId: user.studentId ?? ""
        }
      }
    }
  });

  if (!quiz || !quiz.isPublished) {
    notFound();
  }

  if (quiz.results[0]) {
    const recordedAnswers = quiz.results[0].answers as number[];

    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{quiz.title} Result</CardTitle>
            <CardDescription>You have already submitted this quiz. Review your answers and score below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg font-semibold text-slate-900">
              Score: {quiz.results[0].score}/{quiz.results[0].totalQuestions}
            </p>
            <div className="grid gap-4">
              {quiz.questions.map((question, index) => {
                const selectedAnswer = recordedAnswers[index];
                const isCorrect = selectedAnswer === question.correctAnswer;
                const options = question.options as string[];

                return (
                  <div key={question.id} className="rounded-2xl border border-border/80 bg-white/80 p-4">
                    <p className="font-semibold text-slate-900">Question {index + 1}</p>
                    <p className="mt-2 text-sm text-slate-700">{question.prompt}</p>
                    <div className="mt-3 space-y-2 text-sm">
                      <p className={isCorrect ? "font-medium text-emerald-700" : "font-medium text-rose-700"}>
                        Your answer: {selectedAnswer >= 0 ? options[selectedAnswer] : "No answer selected"}
                      </p>
                      {!isCorrect ? (
                        <p className="text-slate-600">Correct answer: {options[question.correctAnswer]}</p>
                      ) : (
                        <p className="text-slate-600">Correct answer confirmed.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <Link
              href="/dashboard/quizzes"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-brand-600 px-4 py-2 font-medium text-white transition hover:bg-brand-700"
            >
              Back to quizzes
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const questions: QuestionItem[] = quiz.questions.map((question) => ({
    id: question.id,
    prompt: question.prompt,
    options: question.options as string[],
    correctAnswer: question.correctAnswer
  }));

  return <QuizAttempt quiz={{ id: quiz.id, title: quiz.title, description: quiz.description, questions }} />;
}
