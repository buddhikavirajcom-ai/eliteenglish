"use client";

import { type FormEvent, useMemo, useState, useTransition } from "react";
import { FileText, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api-client";
import { homeworkUploadAccept } from "@/lib/file-types";
import { formatDate } from "@/lib/utils";
import type { ClassItem, HomeworkItem } from "@/types/lms";

type ReviewDraft = {
  feedback: string;
  score: string;
  maxScore: string;
};

function statusTone(status: HomeworkItem["submissions"][number]["status"]) {
  switch (status) {
    case "SUBMITTED":
      return "sky" as const;
    case "REVIEWED":
      return "emerald" as const;
    default:
      return "amber" as const;
  }
}

export function HomeworkManager({
  homework,
  classes,
  isAdmin
}: {
  homework: HomeworkItem[];
  classes: ClassItem[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; title: string } | null>(null);
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, ReviewDraft>>({});
  const [isPending, startTransition] = useTransition();

  const summary = useMemo(() => {
    return {
      total: homework.length,
      pending: homework.flatMap((item) => item.submissions).filter((submission) => submission.status === "PENDING").length,
      submitted: homework.flatMap((item) => item.submissions).filter((submission) => submission.status === "SUBMITTED").length,
      reviewed: homework.flatMap((item) => item.submissions).filter((submission) => submission.status === "REVIEWED").length
    };
  }, [homework]);

  const getReviewDraft = (submission: HomeworkItem["submissions"][number]): ReviewDraft => {
    const existing = reviewDrafts[submission.id];

    if (existing) {
      return existing;
    }

    return {
      feedback: submission.feedback ?? "",
      score: submission.score !== null && submission.score !== undefined ? String(submission.score) : "",
      maxScore: submission.maxScore !== null && submission.maxScore !== undefined ? String(submission.maxScore) : ""
    };
  };

  const updateReviewDraft = (submissionId: string, patch: Partial<ReviewDraft>) => {
    setReviewDrafts((current) => ({
      ...current,
      [submissionId]: {
        feedback: current[submissionId]?.feedback ?? "",
        score: current[submissionId]?.score ?? "",
        maxScore: current[submissionId]?.maxScore ?? "",
        ...patch
      }
    }));
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await apiRequest("/api/homework", {
          method: "POST",
          body: formData
        });
        event.currentTarget.reset();
        setFeedback({ tone: "success", title: "Homework added successfully." });
        router.refresh();
      } catch (error) {
        setFeedback({ tone: "error", title: error instanceof Error ? error.message : "Unable to add homework." });
      }
    });
  };

  const handleReview = (submission: HomeworkItem["submissions"][number]) => {
    const draft = getReviewDraft(submission);

    startTransition(async () => {
      try {
        await apiRequest(`/api/homework/submissions/${submission.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            feedback: draft.feedback,
            score: draft.score ? Number(draft.score) : undefined,
            maxScore: draft.maxScore ? Number(draft.maxScore) : undefined,
            status: "REVIEWED"
          })
        });
        setFeedback({ tone: "success", title: "Homework reviewed and result shared with the student." });
        router.refresh();
      } catch (error) {
        setFeedback({ tone: "error", title: error instanceof Error ? error.message : "Unable to review homework." });
      }
    });
  };

  const handleSubmitAnswer = (submissionId: string, event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await apiRequest(`/api/homework/submissions/${submissionId}`, {
          method: "PATCH",
          body: formData
        });
        event.currentTarget.reset();
        setFeedback({ tone: "success", title: "Homework submitted successfully." });
        router.refresh();
      } catch (error) {
        setFeedback({ tone: "error", title: error instanceof Error ? error.message : "Unable to submit homework." });
      }
    });
  };

  return (
    <div className="space-y-6">
      {feedback ? <InlineAlert tone={feedback.tone} title={feedback.title} /> : null}

      <div className="stat-grid">
        <Card>
          <CardContent className="py-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Homework Items</p>
            <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground">{summary.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Pending</p>
            <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-amber-600">{summary.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Submitted</p>
            <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-brand-700">{summary.submitted}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Reviewed</p>
            <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-emerald-700">{summary.reviewed}</p>
          </CardContent>
        </Card>
      </div>

      {isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Add Homework</CardTitle>
            <CardDescription>Attach the task sheet and accept PDF, Word, or scanned image submissions from students.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreate}>
              <div className="field-grid">
                <FormField label="Class" htmlFor="classId" required>
                  <Select id="classId" name="classId" defaultValue={classes[0]?.id ?? ""} required>
                    <option value="">Select a class</option>
                    {classes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Deadline" htmlFor="deadline" required>
                  <Input id="deadline" name="deadline" type="date" required />
                </FormField>
              </div>
              <div className="field-grid">
                <FormField label="Title" htmlFor="title" required>
                  <Input id="title" name="title" placeholder="Grammar worksheet - Unit 3" required />
                </FormField>
                <FormField label="Attachment" htmlFor="attachment">
                  <Input id="attachment" name="attachment" type="file" accept={homeworkUploadAccept} />
                </FormField>
              </div>
              <FormField label="Short instructions" htmlFor="description">
                <Textarea id="description" name="description" placeholder="Tell parents what to complete and how to submit." />
              </FormField>
              <p className="text-xs text-muted-foreground">Accepted files: PDF, DOC, DOCX, JPG, JPEG, PNG, or WEBP up to 10 MB.</p>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Add homework"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{isAdmin ? "Homework Tracker" : "Homework"}</CardTitle>
          <CardDescription>
            {isAdmin ? "Review uploads, record marks, and return feedback." : "Upload homework as PDF, Word, or scanned files and track the teacher's result."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {homework.length === 0 ? (
            <EmptyState title="No homework yet" description="Homework will appear here once the teacher adds the first task." />
          ) : (
            <div className="space-y-4">
              {homework.map((item) => (
                <div key={item.id} className="rounded-[1.75rem] border border-border/80 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-xl font-semibold text-slate-950">{item.title}</h3>
                        <Badge value={item.submissions[0]?.status ?? "PENDING"} tone={statusTone(item.submissions[0]?.status ?? "PENDING")} />
                      </div>
                      <p className="text-sm text-muted-foreground">{item.className} - Due {formatDate(item.deadline)}</p>
                      {item.description ? <p className="text-sm leading-6 text-slate-700">{item.description}</p> : null}
                      {item.attachmentUrl ? (
                        <a className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800" href={item.attachmentUrl} target="_blank">
                          <FileText className="h-4 w-4" />
                          {item.attachmentName ?? "Open attachment"}
                        </a>
                      ) : null}
                    </div>
                  </div>

                  {isAdmin ? (
                    <div className="mt-5 space-y-3">
                      {item.submissions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No students are assigned to this class yet.</p>
                      ) : (
                        item.submissions.map((submission) => (
                          <div key={submission.id} className="rounded-2xl border border-border/70 bg-muted/40 p-4">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                              <div>
                                <p className="font-semibold text-slate-900">{submission.studentName}</p>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                  <Badge value={submission.status} tone={statusTone(submission.status)} />
                                  {submission.responseUrl ? (
                                    <a className="text-sm font-semibold text-brand-700 hover:text-brand-800" href={submission.responseUrl} target="_blank">
                                      {submission.responseName ?? "Open submission"}
                                    </a>
                                  ) : null}
                                </div>
                                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                  {submission.submittedAt ? <p>Submitted {formatDate(submission.submittedAt, "dd MMM yyyy, hh:mm a")}</p> : <p>Waiting for student upload.</p>}
                                  {submission.score !== null && submission.score !== undefined ? (
                                    <p className="font-semibold text-brand-700">
                                      Result: {submission.score}
                                      {submission.maxScore ? ` / ${submission.maxScore}` : ""}
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                              <div className="w-full max-w-xl space-y-3">
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <Input
                                    min={0}
                                    placeholder="Score"
                                    type="number"
                                    value={getReviewDraft(submission).score}
                                    onChange={(event) => updateReviewDraft(submission.id, { score: event.target.value })}
                                  />
                                  <Input
                                    min={0}
                                    placeholder="Max score"
                                    type="number"
                                    value={getReviewDraft(submission).maxScore}
                                    onChange={(event) => updateReviewDraft(submission.id, { maxScore: event.target.value })}
                                  />
                                </div>
                                <Textarea
                                  placeholder="Add clear feedback and next steps for the student"
                                  value={getReviewDraft(submission).feedback}
                                  onChange={(event) =>
                                    updateReviewDraft(submission.id, { feedback: event.target.value })
                                  }
                                />
                                <Button type="button" size="sm" disabled={isPending} onClick={() => handleReview(submission)}>
                                  Save result
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="mt-5 space-y-3">
                      {item.submissions.map((submission) => (
                      <div key={submission.id} className="rounded-2xl border border-border/70 bg-muted/40 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge value={submission.status} tone={statusTone(submission.status)} />
                          {submission.responseUrl ? (
                            <a className="text-sm font-semibold text-brand-700 hover:text-brand-800" href={submission.responseUrl} target="_blank">
                              {submission.responseName ?? "View submitted file"}
                            </a>
                          ) : null}
                        </div>
                        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                          {submission.submittedAt ? <p>Last uploaded {formatDate(submission.submittedAt, "dd MMM yyyy, hh:mm a")}</p> : <p>Upload your work before the deadline.</p>}
                          <p>Accepted: PDF, DOC, DOCX, JPG, JPEG, PNG, WEBP.</p>
                        </div>
                        <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={(event) => handleSubmitAnswer(submission.id, event)}>
                          <Input name="answer" type="file" accept={homeworkUploadAccept} required={submission.status !== "REVIEWED"} />
                          <Button type="submit" disabled={isPending} className="sm:w-auto">
                            <UploadCloud className="h-4 w-4" />
                            {submission.status === "PENDING" ? "Upload homework" : "Replace file"}
                          </Button>
                        </form>
                        {submission.score !== null && submission.score !== undefined ? (
                          <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-900">
                            <p className="font-semibold">
                              Result: {submission.score}
                              {submission.maxScore ? ` / ${submission.maxScore}` : ""}
                            </p>
                          </div>
                        ) : null}
                          {submission.feedback ? (
                            <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                              <p className="font-semibold">Teacher feedback</p>
                              <p className="mt-1">{submission.feedback}</p>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
