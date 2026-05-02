"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/api-client";
import type { QuestionItem } from "@/types/lms";

export function QuizAttempt({
  quiz
}: {
  quiz: {
    id: string;
    title: string;
    description?: string | null;
    questions: QuestionItem[];
  };
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<number[]>(() => Array(quiz.questions.length).fill(-1));
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async () => {
    if (answers.some((answer) => answer < 0)) {
      setMessage("Answer every question before submitting.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await apiRequest<{ score: number; totalQuestions: number; message: string }>(`/api/quizzes/${quiz.id}/submit`, {
          method: "POST",
          body: JSON.stringify({
            answers
          })
        });
        setMessage(`${response.message} You scored ${response.score}/${response.totalQuestions}.`);
        router.push("/dashboard/quizzes");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to submit quiz.");
      }
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
          <CardDescription>{quiz.description || "Answer every question and submit for auto-scoring."}</CardDescription>
        </CardHeader>
      </Card>

      {message ? <div className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-800">{message}</div> : null}

      <div className="space-y-4">
        {quiz.questions.map((question, questionIndex) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-lg">Question {questionIndex + 1}</CardTitle>
              <CardDescription>{question.prompt}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {question.options.map((option, optionIndex) => (
                <label key={`${question.id}-${optionIndex}`} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                  <input
                    checked={answers[questionIndex] === optionIndex}
                    className="h-4 w-4"
                    name={question.id}
                    type="radio"
                    onChange={() =>
                      setAnswers((current) => current.map((answer, currentIndex) => (currentIndex === questionIndex ? optionIndex : answer)))
                    }
                  />
                  <span>{option}</span>
                </label>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Button disabled={isPending} onClick={handleSubmit} size="lg" type="button">
        {isPending ? "Submitting..." : "Submit quiz"}
      </Button>
    </div>
  );
}
