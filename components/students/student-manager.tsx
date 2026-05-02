/* eslint-disable @next/next/no-img-element */

"use client";

import { type ReactNode, useEffect, useMemo, useState, useTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Search, Trash2, UserRound, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiRequest } from "@/lib/api-client";
import { cn, formatCurrency, formatDate, formatMonthLabel } from "@/lib/utils";
import { updateStudentSchema } from "@/lib/validators";
import type { StudentItem } from "@/types/lms";

type StudentFormValues = z.input<typeof updateStudentSchema>;

function createDefaultValues(): StudentFormValues {
  return {
    name: "",
    phone: "",
    email: "",
    parentName: "",
    parentContact: "",
    grade: "",
    school: "",
    learningLevel: "",
    notes: "",
    password: ""
  };
}

function studentToForm(student: StudentItem): StudentFormValues {
  return {
    name: student.name,
    phone: student.phone,
    email: student.email ?? "",
    parentName: student.parentName,
    parentContact: student.parentContact ?? "",
    grade: student.grade ?? "",
    school: student.school ?? "",
    learningLevel: student.learningLevel ?? "",
    notes: student.notes ?? "",
    password: ""
  };
}

function ModalShell({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "max-w-5xl"
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/55 p-4 backdrop-blur-sm" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="flex min-h-full items-center justify-center">
        <div className={cn("panel-surface flex max-h-[90vh] w-full flex-col overflow-hidden p-0 shadow-2xl", maxWidth)}>
          <div className="flex items-start justify-between gap-4 border-b border-border/70 px-6 py-5">
            <div className="space-y-1">
              <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-slate-950">{title}</h2>
              {description ? <p className="text-sm leading-6 text-muted-foreground">{description}</p> : null}
            </div>
            <Button variant="ghost" size="sm" className="rounded-full px-2.5" onClick={onClose} aria-label="Close dialog">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">{children}</div>
          {footer ? <div className="border-t border-border/70 px-6 py-4">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

function MetricTile({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "success" | "warning" }) {
  const toneStyles = {
    default: "bg-slate-100 text-slate-900",
    success: "bg-emerald-50 text-emerald-900",
    warning: "bg-amber-50 text-amber-900"
  } satisfies Record<string, string>;

  return (
    <div className={cn("rounded-[1.5rem] px-4 py-4", toneStyles[tone])}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.35rem] border border-border/70 bg-slate-50/90 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

export function StudentManager({ initialStudents }: { initialStudents: StudentItem[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; title: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors }
  } = useForm<StudentFormValues>({
    resolver: zodResolver(updateStudentSchema),
    defaultValues: createDefaultValues()
  });

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return initialStudents;
    }

    return initialStudents.filter((student) =>
      [student.name, student.parentName, student.phone, student.grade, student.school, student.learningLevel]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [initialStudents, search]);

  const selectedStudent = useMemo(
    () => initialStudents.find((student) => student.id === selectedStudentId) ?? null,
    [initialStudents, selectedStudentId]
  );

  useEffect(() => {
    if (selectedStudentId && !selectedStudent) {
      setSelectedStudentId(null);
    }

    if (editingStudentId && !initialStudents.some((student) => student.id === editingStudentId)) {
      setEditingStudentId(null);
      setIsFormOpen(false);
      reset(createDefaultValues());
    }
  }, [editingStudentId, initialStudents, reset, selectedStudent, selectedStudentId]);

  useEffect(() => {
    if (!isFormOpen && !selectedStudentId) {
      return;
    }

    const originalOverflow = document.body.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      if (isFormOpen) {
        setIsFormOpen(false);
        setEditingStudentId(null);
        reset(createDefaultValues());
        return;
      }

      setSelectedStudentId(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFormOpen, reset, selectedStudentId]);

  const openCreateModal = () => {
    setEditingStudentId(null);
    setSelectedStudentId(null);
    setFeedback(null);
    reset(createDefaultValues());
    setIsFormOpen(true);
  };

  const openEditModal = (student: StudentItem) => {
    setEditingStudentId(student.id);
    setSelectedStudentId(null);
    setFeedback(null);
    reset(studentToForm(student));
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setEditingStudentId(null);
    reset(createDefaultValues());
  };

  const onSubmit = handleSubmit((values) => {
    if (!editingStudentId && !values.password) {
      setError("password", { message: "Password is required when creating a student." });
      return;
    }

    setFeedback(null);

    startTransition(async () => {
      try {
        if (editingStudentId) {
          await apiRequest(`/api/students/${editingStudentId}`, {
            method: "PATCH",
            body: JSON.stringify(values)
          });
          setFeedback({ tone: "success", title: "Student updated successfully." });
        } else {
          await apiRequest("/api/students", {
            method: "POST",
            body: JSON.stringify(values)
          });
          setFeedback({ tone: "success", title: "Student created successfully." });
        }

        closeFormModal();
        router.refresh();
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.fieldErrors) {
            Object.entries(error.fieldErrors).forEach(([field, messages]) => {
              if (!messages?.[0]) {
                return;
              }

              setError(field as keyof StudentFormValues, { message: messages[0] });
            });
          }

          setFeedback({ tone: "error", title: error.message });
          return;
        }

        setFeedback({ tone: "error", title: error instanceof Error ? error.message : "Unable to save student." });
      }
    });
  });

  const handleDelete = (student: StudentItem) => {
    if (!window.confirm(`Delete ${student.name}? This will remove the student and their portal access.`)) {
      return;
    }

    startTransition(async () => {
      try {
        await apiRequest(`/api/students/${student.id}`, {
          method: "DELETE"
        });
        if (editingStudentId === student.id) {
          closeFormModal();
        }
        if (selectedStudentId === student.id) {
          setSelectedStudentId(null);
        }
        setFeedback({ tone: "success", title: "Student deleted successfully." });
        router.refresh();
      } catch (error) {
        setFeedback({ tone: "error", title: error instanceof Error ? error.message : "Unable to delete student." });
      }
    });
  };

  return (
    <div className="space-y-6">
      {feedback ? <InlineAlert tone={feedback.tone} title={feedback.title} /> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="py-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Students</p>
            <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground">{initialStudents.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Pending Payments</p>
            <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-amber-600">
              {initialStudents.filter((student) => student.pendingTotal > 0).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Recent Progress</p>
            <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-brand-700">
              {initialStudents.filter((student) => student.latestProgressMonth).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="p-0">
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-lg font-semibold text-slate-950">Students</p>
              <p className="text-sm text-muted-foreground">Keep the page simple. Click any student card to open all details in one popup.</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <div className="relative w-full sm:min-w-[300px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-11" placeholder="Search by student, parent, school, or level" value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
              <Button onClick={openCreateModal}>
                <Plus className="h-4 w-4" />
                Add student
              </Button>
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <EmptyState title="No students found" description="Try another search or add a new student to get started." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredStudents.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  className="panel-surface group flex h-full flex-col gap-4 p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
                  onClick={() => setSelectedStudentId(student.id)}
                  aria-haspopup="dialog"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="rounded-[1.35rem] bg-brand-50 p-3 text-brand-700">
                        <UserRound className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-display text-xl font-semibold tracking-[-0.03em] text-slate-950">{student.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {student.grade || "Grade not added"}
                          {student.school ? ` - ${student.school}` : ""}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Details
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-slate-700">
                    <p>Parent: {student.parentName}</p>
                    <p>Phone: {student.phone}</p>
                    <p>Level: {student.learningLevel || "Not added"}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <MetricTile label="Classes" value={String(student.classCount)} />
                    <MetricTile label="Paid" value={formatCurrency(student.paidTotal)} tone="success" />
                    <MetricTile label="Pending" value={formatCurrency(student.pendingTotal)} tone="warning" />
                  </div>

                  <div className="mt-auto rounded-[1.35rem] border border-border/70 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
                    Latest progress: {student.latestProgressMonth ? formatMonthLabel(student.latestProgressMonth) : "No update yet"}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ModalShell
        open={Boolean(selectedStudent)}
        onClose={() => setSelectedStudentId(null)}
        title={selectedStudent?.name ?? "Student details"}
        description="Everything important is in one place, including contact details, learning info, payment summary, and QR access."
      >
        {selectedStudent ? (
          <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
            <div className="space-y-4">
              <div className="rounded-[1.75rem] border border-border/70 bg-gradient-to-br from-brand-50 via-white to-slate-50 p-5 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-brand-100 text-brand-700">
                  <UserRound className="h-6 w-6" />
                </div>
                <p className="mt-4 font-display text-2xl font-semibold tracking-[-0.03em] text-slate-950">{selectedStudent.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{selectedStudent.grade || "Grade not added"}</p>
                <div className="mt-5 rounded-[1.5rem] border border-border/70 bg-white p-4">
                  <img alt={`${selectedStudent.name} QR`} className="mx-auto h-40 w-40 rounded-[1.5rem] border border-border bg-white p-3" src={selectedStudent.qrPreview} />
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">QR Code</p>
                  <p className="mt-1 break-all text-sm font-medium text-slate-800">{selectedStudent.qrCode}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <MetricTile label="Classes" value={String(selectedStudent.classCount)} />
                <MetricTile label="Attendance" value={String(selectedStudent.attendanceCount)} />
                <MetricTile label="Paid" value={formatCurrency(selectedStudent.paidTotal)} tone="success" />
                <MetricTile label="Pending" value={formatCurrency(selectedStudent.pendingTotal)} tone="warning" />
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailItem label="Phone" value={selectedStudent.phone} />
                <DetailItem label="Email" value={selectedStudent.email || "Not added"} />
                <DetailItem label="Parent Name" value={selectedStudent.parentName} />
                <DetailItem label="Parent Contact" value={selectedStudent.parentContact || "Not added"} />
                <DetailItem label="School" value={selectedStudent.school || "Not added"} />
                <DetailItem label="Learning Level" value={selectedStudent.learningLevel || "Not added"} />
                <DetailItem label="Latest Progress" value={selectedStudent.latestProgressMonth ? formatMonthLabel(selectedStudent.latestProgressMonth) : "No update yet"} />
                <DetailItem label="Added On" value={formatDate(selectedStudent.createdAt)} />
              </div>

              <div className="rounded-[1.6rem] border border-border/70 bg-slate-50/90 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Notes</p>
                <p className="mt-3 text-sm leading-7 text-slate-700">{selectedStudent.notes || "No notes added for this student yet."}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => openEditModal(selectedStudent)}
                  disabled={isPending}
                >
                  <Pencil className="h-4 w-4" />
                  Edit student
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(selectedStudent)}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete student
                </Button>
                <Button variant="ghost" onClick={() => setSelectedStudentId(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </ModalShell>

      <ModalShell
        open={isFormOpen}
        onClose={closeFormModal}
        title={editingStudentId ? "Edit Student" : "Add Student"}
        description={editingStudentId ? "Update the student profile and keep the details clear and parent-friendly." : "Create a new student and portal login without leaving this page."}
        maxWidth="max-w-3xl"
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={closeFormModal} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" form="student-form" disabled={isPending}>
              <Plus className="h-4 w-4" />
              {isPending ? "Saving..." : editingStudentId ? "Save changes" : "Create student"}
            </Button>
          </div>
        }
      >
        <form id="student-form" className="space-y-4" onSubmit={onSubmit}>
          <FormField label="Student name" htmlFor="name" error={errors.name?.message} required>
            <Input id="name" placeholder="Student name" {...register("name")} />
          </FormField>

          <div className="field-grid">
            <FormField label="Phone" htmlFor="phone" error={errors.phone?.message} required>
              <Input id="phone" placeholder="Phone number" {...register("phone")} />
            </FormField>
            <FormField label="Email" htmlFor="email" error={errors.email?.message ?? undefined}>
              <Input id="email" placeholder="Email address" {...register("email")} />
            </FormField>
          </div>

          <div className="field-grid">
            <FormField label="Parent name" htmlFor="parentName" error={errors.parentName?.message} required>
              <Input id="parentName" placeholder="Parent name" {...register("parentName")} />
            </FormField>
            <FormField label="Parent contact" htmlFor="parentContact" error={errors.parentContact?.message ?? undefined}>
              <Input id="parentContact" placeholder="WhatsApp or alternate number" {...register("parentContact")} />
            </FormField>
          </div>

          <div className="field-grid">
            <FormField label="Grade" htmlFor="grade" error={errors.grade?.message ?? undefined}>
              <Input id="grade" placeholder="Grade 6" {...register("grade")} />
            </FormField>
            <FormField label="School" htmlFor="school" error={errors.school?.message ?? undefined}>
              <Input id="school" placeholder="School name" {...register("school")} />
            </FormField>
          </div>

          <FormField label="Learning level" htmlFor="learningLevel" error={errors.learningLevel?.message ?? undefined}>
            <Input id="learningLevel" placeholder="Beginner / Intermediate" {...register("learningLevel")} />
          </FormField>

          <FormField
            label={editingStudentId ? "New password" : "Portal password"}
            htmlFor="password"
            error={errors.password?.message}
            hint={editingStudentId ? "Leave blank to keep the current password." : undefined}
          >
            <Input id="password" type="password" placeholder="Password" {...register("password")} />
          </FormField>

          <FormField label="Notes" htmlFor="notes" error={errors.notes?.message ?? undefined}>
            <Textarea id="notes" placeholder="Helpful learning notes for the teacher." {...register("notes")} />
          </FormField>
        </form>
      </ModalShell>
    </div>
  );
}
