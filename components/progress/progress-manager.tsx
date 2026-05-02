"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpenCheck, Headphones, MessageSquareText, Mic2, PencilLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StarRating } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiRequest } from "@/lib/api-client";
import { formatMonthLabel } from "@/lib/utils";
import { progressSchema, type ProgressFormValues } from "@/lib/validators";
import type { ProgressItem, StudentOption } from "@/types/lms";

const skillMeta = [
  { key: "listening", label: "Listening", icon: Headphones },
  { key: "reading", label: "Reading", icon: BookOpenCheck },
  { key: "writing", label: "Writing", icon: PencilLine },
  { key: "speaking", label: "Speaking", icon: Mic2 }
] as const;

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function ProgressManager({
  entries,
  students,
  isAdmin,
  initialStudentId
}: {
  entries: ProgressItem[];
  students: StudentOption[];
  isAdmin: boolean;
  initialStudentId?: string;
}) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; title: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    formState: { errors }
  } = useForm<ProgressFormValues>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      studentId: initialStudentId ?? students[0]?.id ?? "",
      month: currentMonth(),
      listening: 3,
      reading: 3,
      writing: 3,
      speaking: 3,
      comment: "",
      testMark: undefined
    }
  });

  const selectedStudentId = watch("studentId");
  const filteredEntries = useMemo(() => {
    if (!isAdmin || !selectedStudentId) {
      return entries;
    }

    return entries.filter((entry) => entry.studentId === selectedStudentId);
  }, [entries, isAdmin, selectedStudentId]);

  const submitForm = handleSubmit((values) => {
    setFeedback(null);

    startTransition(async () => {
      try {
        await apiRequest("/api/progress", {
          method: "POST",
          body: JSON.stringify(values)
        });
        setFeedback({ tone: "success", title: "Progress saved successfully." });
        reset({ ...values, comment: values.comment ?? "", testMark: values.testMark });
        router.refresh();
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.fieldErrors) {
            Object.entries(error.fieldErrors).forEach(([field, messages]) => {
              if (!messages?.[0]) {
                return;
              }

              setError(field as keyof ProgressFormValues, { message: messages[0] });
            });
          }

          setFeedback({ tone: "error", title: error.message });
          return;
        }

        setFeedback({ tone: "error", title: "Unable to save progress right now." });
      }
    });
  });

  return (
    <div className="space-y-6">
      {feedback ? <InlineAlert tone={feedback.tone} title={feedback.title} /> : null}

      {isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Update Progress</CardTitle>
            <CardDescription>Rate the four language skills, add a short comment, and keep progress updates quick.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={submitForm}>
              <div className="field-grid">
                <FormField label="Student" htmlFor="studentId" error={errors.studentId?.message} required>
                  <Select id="studentId" {...register("studentId")}>
                    <option value="">Select a student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Month" htmlFor="month" error={errors.month?.message} required>
                  <Input id="month" type="month" {...register("month")} />
                </FormField>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {skillMeta.map((skill) => {
                  const Icon = skill.icon;
                  const currentValue = Number(watch(skill.key) ?? 0);

                  return (
                    <div key={skill.key} className="rounded-[1.5rem] border border-border/80 bg-muted/40 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <Icon className="h-4 w-4 text-brand-600" />
                        {skill.label}
                      </div>
                      <div className="mt-3">
                        <StarRating value={currentValue} onChange={(value) => setValue(skill.key, value, { shouldValidate: true })} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="field-grid">
                <FormField label="Teacher comment" htmlFor="comment" error={errors.comment?.message} className="md:col-span-2">
                  <Textarea id="comment" placeholder="Short note for parents about strengths and next focus areas." {...register("comment")} />
                </FormField>
                <FormField label="Optional test mark" htmlFor="testMark" error={errors.testMark?.message}>
                  <Input id="testMark" min="0" max="100" type="number" placeholder="e.g. 84" {...register("testMark")} />
                </FormField>
              </div>

              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save progress"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{isAdmin ? "Monthly Progress History" : "Progress Summary"}</CardTitle>
          <CardDescription>
            {isAdmin ? "Recent updates for the selected student or the full class list." : "A simple month-by-month view of your child's English progress."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEntries.length === 0 ? (
            <EmptyState title="No progress updates yet" description="Progress records will appear here after the first monthly update." />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {filteredEntries.map((entry) => (
                <div key={entry.id} className="rounded-[1.5rem] border border-border/80 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{entry.studentName}</p>
                      <p className="text-sm text-muted-foreground">{formatMonthLabel(entry.month)}</p>
                    </div>
                    {entry.testMark !== null && entry.testMark !== undefined ? (
                      <div className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">Test mark: {entry.testMark}%</div>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {skillMeta.map((skill) => (
                      <div key={skill.key} className="rounded-2xl bg-muted/50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{skill.label}</p>
                        <div className="mt-2">
                          <StarRating value={entry[skill.key]} readOnly size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {entry.comment ? (
                    <div className="mt-4 rounded-2xl border border-border/70 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      <div className="mb-2 flex items-center gap-2 font-semibold text-slate-900">
                        <MessageSquareText className="h-4 w-4 text-brand-600" />
                        Teacher comment
                      </div>
                      <p>{entry.comment}</p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}