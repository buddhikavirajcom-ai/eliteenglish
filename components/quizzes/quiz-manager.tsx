"use client";

import Link from "next/link";
import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ListChecks, PlusCircle, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api-client";
import { formatDate, formatPercent } from "@/lib/utils";
import type { QuizItem } from "@/types/lms";

type DraftQuestion = {
  prompt: string;
  options: string[];
  correctAnswer: number;
};

const createQuestion = (): DraftQuestion => ({
  prompt: "",
  options: ["", "", "", ""],
  correctAnswer: 0
});

export function QuizManager({ quizzes, isAdmin }: { quizzes: QuizItem[]; isAdmin: boolean }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<DraftQuestion[]>([createQuestion()]);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        await apiRequest("/api/quizzes", {
          method: "POST",
          body: JSON.stringify({
            title,
            description,
            questions
          })
        });
        setTitle("");
        setDescription("");
        setQuestions([createQuestion()]);
        setMessage("Quiz created successfully.");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to create quiz.");
      }
    });
  };

  const updateQuestion = (index: number, next: Partial<DraftQuestion>) => {
    setQuestions((current) => current.map((question, questionIndex) => (questionIndex === index ? { ...question, ...next } : question)));
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuestions((current) =>
      current.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              options: question.options.map((option, currentOptionIndex) => (currentOptionIndex === optionIndex ? value : option))
            }
          : question
      )
    );
  };

  return (
    <div className="space-y-6">
      {message ? <div className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-800">{message}</div> : null}

      {isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Create Quiz</CardTitle>
            <CardDescription>Add MCQ questions and auto-scoring rules in one form.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <Input placeholder="Quiz title" value={title} onChange={(event) => setTitle(event.target.value)} />
                <Textarea placeholder="Description (optional)" value={description} onChange={(event) => setDescription(event.target.value)} />
              </div>

              <div className="space-y-4">
                {questions.map((question, questionIndex) => (
                  <div key={`question-${questionIndex}`} className="rounded-3xl border border-slate-200 p-5">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <p className="font-semibold text-slate-900">Question {questionIndex + 1}</p>
                      {questions.length > 1 ? (
                        <button
                          className="text-sm font-medium text-rose-600"
                          type="button"
                          onClick={() => setQuestions((current) => current.filter((_, index) => index !== questionIndex))}
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Question prompt"
                        value={question.prompt}
                        onChange={(event) => updateQuestion(questionIndex, { prompt: event.target.value })}
                      />
                      <div className="grid gap-3 md:grid-cols-2">
                        {question.options.map((option, optionIndex) => (
                          <Input
                            key={`question-${questionIndex}-option-${optionIndex}`}
                            placeholder={`Option ${optionIndex + 1}`}
                            value={option}
                            onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)}
                          />
                        ))}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Correct answer</label>
                        <select
                          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm"
                          value={question.correctAnswer}
                          onChange={(event) => updateQuestion(questionIndex, { correctAnswer: Number(event.target.value) })}
                        >
                          {question.options.map((_, optionIndex) => (
                            <option key={`correct-${questionIndex}-${optionIndex}`} value={optionIndex}>
                              Option {optionIndex + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button className="gap-2" disabled={isPending} type="submit">
                  <PlusCircle className="h-4 w-4" />
                  Save quiz
                </Button>
                <Button variant="outline" type="button" onClick={() => setQuestions((current) => [...current, createQuestion()])}>
                  Add question
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{isAdmin ? "Quiz Library" : "Available Quizzes"}</CardTitle>
          <CardDescription>{isAdmin ? "Published quizzes and response metrics." : "Attempt quizzes and review your scores."}</CardDescription>
        </CardHeader>
        <CardContent>
          {quizzes.length === 0 ? (
            <EmptyState title="No quizzes yet" description="Create the first quiz to start measuring learning progress." />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {quizzes.map((quiz) => (
                <Card key={quiz.id} className="border border-slate-200 shadow-none">
                  <CardContent className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-display text-2xl font-semibold text-slate-950">{quiz.title}</p>
                        <p className="mt-2 text-sm text-slate-600">{quiz.description || "No description provided."}</p>
                      </div>
                      <Badge value={`${quiz.questionCount} questions`} tone="sky" />
                    </div>

                    {isAdmin ? (
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Questions</p>
                          <p className="mt-2 text-xl font-semibold text-slate-900">{quiz.questionCount}</p>
                        </div>
                        <div className="rounded-2xl bg-brand-50 p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-brand-700">Attempts</p>
                          <p className="mt-2 text-xl font-semibold text-brand-900">{quiz.attemptCount}</p>
                        </div>
                        <div className="rounded-2xl bg-emerald-50 p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-emerald-700">Average</p>
                          <p className="mt-2 text-xl font-semibold text-emerald-900">{formatPercent(quiz.averageScore)}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-slate-50 p-4">
                        {quiz.result ? (
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-semibold text-slate-900">Completed</p>
                              <p className="mt-1 text-sm text-slate-600">Submitted {formatDate(quiz.result.submittedAt, "dd MMM yyyy, hh:mm a")}</p>
                            </div>
                            <div className="text-right">
                              <Badge value={`${quiz.result.score}/${quiz.result.totalQuestions}`} tone="emerald" />
                              <p className="mt-1 text-sm font-semibold text-emerald-700">{quiz.result.percentage}%</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-semibold text-slate-900">Ready to attempt</p>
                              <p className="mt-1 text-sm text-slate-600">Auto-scored immediately after submission.</p>
                            </div>
                            <Link
                              href={`/dashboard/quizzes/attempt/${quiz.id}`}
                              className="inline-flex h-11 items-center justify-center rounded-2xl bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
                            >
                              Attempt quiz
                            </Link>
                          </div>
                        )}
                      </div>
                    )}

                    {isAdmin && quiz.results && quiz.results.length > 0 ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-sm font-semibold text-slate-900">Latest student results</p>
                        <div className="mt-3 space-y-3">
                          {quiz.results.slice(0, 4).map((result) => (
                            <div key={`${quiz.id}-${result.studentId}-${result.submittedAt}`} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                              <div>
                                <p className="font-medium text-slate-900">{result.studentName}</p>
                                <p className="text-sm text-slate-600">
                                  Submitted {formatDate(result.submittedAt, "dd MMM yyyy, hh:mm a")}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-slate-900">
                                  {result.score}/{result.totalQuestions}
                                </p>
                                <p className="text-sm text-emerald-700">{result.percentage}%</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span className="inline-flex items-center gap-2">
                        <ListChecks className="h-4 w-4" />
                        Created {formatDate(quiz.createdAt)}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        {isAdmin ? "Teacher view" : quiz.result ? "Scored" : "Pending"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
