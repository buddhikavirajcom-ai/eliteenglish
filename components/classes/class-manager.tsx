"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock3, Link2, MapPin, Search, SquarePen, Trash2, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiRequest } from "@/lib/api-client";
import { classSchema, type ClassFormValues } from "@/lib/validators";
import { cn, formatCurrency, formatDate, formatScheduleDay, formatTimeRange, toPlainDate } from "@/lib/utils";
import type { ClassEnrollmentRequestItem, ClassItem, ClassStatus, ScheduleDay, StudentOption, TeacherOption } from "@/types/lms";

const scheduleDayOptions: ScheduleDay[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const classStatusOptions: ClassStatus[] = ["ACTIVE", "DRAFT", "COMPLETED", "CANCELLED"];

function currentScheduleDay(): ScheduleDay {
  const days: ScheduleDay[] = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  return days[new Date().getDay()];
}

function createDefaultValues(teacherId?: string): ClassFormValues {
  return {
    title: "",
    subject: "",
    teacherId: teacherId ?? "",
    level: "",
    type: "ONLINE",
    status: "ACTIVE",
    date: toPlainDate(new Date()),
    scheduleDay: currentScheduleDay(),
    startTime: "18:00",
    endTime: "19:30",
    meetingLink: "",
    location: "",
    capacity: 20,
    fee: 0,
    notes: "",
    studentIds: []
  };
}

function classToFormValues(lesson: ClassItem): ClassFormValues {
  return {
    title: lesson.title,
    subject: lesson.subject,
    teacherId: lesson.teacher.id,
    level: lesson.level,
    type: lesson.type,
    status: lesson.status,
    date: toPlainDate(lesson.date),
    scheduleDay: lesson.scheduleDay,
    startTime: lesson.startTime,
    endTime: lesson.endTime,
    meetingLink: lesson.meetingLink ?? "",
    location: lesson.location ?? "",
    capacity: lesson.capacity,
    fee: lesson.fee,
    notes: lesson.notes ?? "",
    studentIds: lesson.studentIds
  };
}

export function ClassManager({
  students,
  teachers,
  classes,
  enrollmentRequests,
  isAdmin
}: {
  students: StudentOption[];
  teachers: TeacherOption[];
  classes: ClassItem[];
  enrollmentRequests: ClassEnrollmentRequestItem[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ClassStatus>("ALL");
  const [feedback, setFeedback] = useState<{ tone: "success" | "error" | "info"; title: string; description?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    formState: { errors }
  } = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: createDefaultValues(teachers[0]?.id)
  });

  const selectedStudentIds = watch("studentIds") ?? [];
  const selectedType = watch("type");
  const selectedCapacity = watch("capacity");
  const selectedTeacherId = watch("teacherId");

  const filteredClasses = useMemo(() => {
    return classes.filter((lesson) => {
      const query = search.trim().toLowerCase();
      const matchesQuery =
        query.length === 0 ||
        [lesson.title, lesson.subject, lesson.level, lesson.teacher.name].some((value) => value.toLowerCase().includes(query));
      const matchesStatus = statusFilter === "ALL" || lesson.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [classes, search, statusFilter]);

  const summary = useMemo(() => {
    const assignedSeats = classes.reduce((total, lesson) => total + lesson.students.length, 0);
    const totalCapacity = classes.reduce((total, lesson) => total + lesson.capacity, 0);
    return {
      total: classes.length,
      active: classes.filter((lesson) => lesson.status === "ACTIVE").length,
      assignedSeats,
      totalCapacity
    };
  }, [classes]);

  const submitForm = handleSubmit((values) => {
    setFeedback(null);

    startTransition(async () => {
      try {
        if (editingClassId) {
          await apiRequest(`/api/classes/${editingClassId}`, {
            method: "PATCH",
            body: JSON.stringify(values)
          });
          setFeedback({
            tone: "success",
            title: "Class updated successfully.",
            description: "The schedule, teacher, and student assignments were saved."
          });
        } else {
          await apiRequest("/api/classes", {
            method: "POST",
            body: JSON.stringify(values)
          });
          setFeedback({
            tone: "success",
            title: "Class created successfully.",
            description: "The new class is now available in the class list."
          });
        }

        setEditingClassId(null);
        reset(createDefaultValues(teachers[0]?.id));
        router.refresh();
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.fieldErrors) {
            Object.entries(error.fieldErrors).forEach(([field, messages]) => {
              if (!messages?.[0]) {
                return;
              }

              setError(field as keyof ClassFormValues, {
                message: messages[0]
              });
            });
          }

          setError("root", {
            message: error.message
          });
          setFeedback({ tone: "error", title: error.message });
          return;
        }

        setFeedback({ tone: "error", title: "Unable to save class right now." });
      }
    });
  });

  const handleEdit = (lesson: ClassItem) => {
    setEditingClassId(lesson.id);
    setFeedback(null);
    reset(classToFormValues(lesson));
  };

  const handleCancelEdit = () => {
    setEditingClassId(null);
    setFeedback(null);
    reset(createDefaultValues(teachers[0]?.id));
  };

  const handleDelete = (lesson: ClassItem) => {
    if (!window.confirm(`Delete ${lesson.title}? This will also remove assigned students from the class.`)) {
      return;
    }

    startTransition(async () => {
      try {
        await apiRequest(`/api/classes/${lesson.id}`, {
          method: "DELETE"
        });
        if (editingClassId === lesson.id) {
          handleCancelEdit();
        }
        setFeedback({ tone: "success", title: "Class deleted successfully." });
        router.refresh();
      } catch (error) {
        setFeedback({
          tone: "error",
          title: error instanceof Error ? error.message : "Unable to delete class."
        });
      }
    });
  };


  const handleRequestReview = (request: ClassEnrollmentRequestItem, action: "APPROVE" | "REJECT") => {
    const confirmationMessage =
      action === "APPROVE"
        ? `Approve ${request.studentName}'s request for ${request.className}? This will add the student to the class and record the uploaded payment slip.`
        : `Reject ${request.studentName}'s request for ${request.className}?`;

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await apiRequest<{ message: string }>(`/api/enrollment-requests/${request.id}`, {
          method: "PATCH",
          body: JSON.stringify({ action })
        });
        setFeedback({ tone: "success", title: response.message });
        router.refresh();
      } catch (error) {
        setFeedback({
          tone: "error",
          title: error instanceof Error ? error.message : "Unable to update the enrollment request."
        });
      }
    });
  };

  const toggleSelectedStudent = (studentId: string) => {
    const nextSelection = selectedStudentIds.includes(studentId)
      ? selectedStudentIds.filter((id) => id !== studentId)
      : [...selectedStudentIds, studentId];

    setValue("studentIds", nextSelection, {
      shouldDirty: true,
      shouldValidate: true
    });
  };

  return (
    <div className="space-y-6">
      {feedback ? <InlineAlert tone={feedback.tone} title={feedback.title} description={feedback.description} /> : null}

      <div className="stat-grid">
        <Card>
          <CardContent className="py-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Scheduled Classes</p>
            <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground">{summary.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Active Classes</p>
            <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-brand-700">{summary.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Assigned Seats</p>
            <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground">{summary.assignedSeats}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Capacity Coverage</p>
            <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground">{summary.totalCapacity}</p>
          </CardContent>
        </Card>
      </div>

      {isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingClassId ? "Edit Class" : "Add Class"}</CardTitle>
            <CardDescription>
              Configure the schedule, teacher, student roster, meeting details, and billing information in one place.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teachers.length === 0 ? (
              <InlineAlert
                tone="warning"
                title="No teacher accounts available."
                description="Create at least one admin account before scheduling classes."
              />
            ) : (
              <form className="space-y-6" onSubmit={submitForm}>
                {errors.root?.message ? <InlineAlert tone="error" title={errors.root.message} /> : null}

                <div className="grid gap-6 xl:grid-cols-2">
                  <div className="space-y-4">
                    <FormField label="Class name" htmlFor="title" error={errors.title?.message} required>
                      <Input id="title" placeholder="Advanced Algebra" {...register("title")} />
                    </FormField>
                    <FormField label="Subject / course" htmlFor="subject" error={errors.subject?.message} required>
                      <Input id="subject" placeholder="Mathematics" {...register("subject")} />
                    </FormField>
                    <div className="field-grid">
                      <FormField label="Teacher" htmlFor="teacherId" error={errors.teacherId?.message} required>
                        <Select id="teacherId" {...register("teacherId")}>
                          {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </option>
                          ))}
                        </Select>
                      </FormField>
                      <FormField label="Level" htmlFor="level" error={errors.level?.message} required>
                        <Input id="level" placeholder="Grade 10" {...register("level")} />
                      </FormField>
                    </div>
                    <div className="field-grid">
                      <FormField label="Type" htmlFor="type" error={errors.type?.message} required>
                        <Select id="type" {...register("type")}>
                          <option value="ONLINE">Online</option>
                          <option value="OFFLINE">Offline</option>
                        </Select>
                      </FormField>
                      <FormField label="Status" htmlFor="status" error={errors.status?.message} required>
                        <Select id="status" {...register("status")}>
                          {classStatusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status.replaceAll("_", " ")}
                            </option>
                          ))}
                        </Select>
                      </FormField>
                    </div>
                    <div className="field-grid">
                      <FormField label="Next session date" htmlFor="date" error={errors.date?.message} required>
                        <Input id="date" type="date" {...register("date")} />
                      </FormField>
                      <FormField label="Weekly schedule day" htmlFor="scheduleDay" error={errors.scheduleDay?.message} required>
                        <Select id="scheduleDay" {...register("scheduleDay")}>
                          {scheduleDayOptions.map((day) => (
                            <option key={day} value={day}>
                              {formatScheduleDay(day)}
                            </option>
                          ))}
                        </Select>
                      </FormField>
                    </div>
                    <div className="field-grid">
                      <FormField label="Start time" htmlFor="startTime" error={errors.startTime?.message} required>
                        <Input id="startTime" type="time" {...register("startTime")} />
                      </FormField>
                      <FormField label="End time" htmlFor="endTime" error={errors.endTime?.message} required>
                        <Input id="endTime" type="time" {...register("endTime")} />
                      </FormField>
                    </div>
                    <div className="field-grid">
                      <FormField
                        label={selectedType === "ONLINE" ? "Meeting link" : "Location"}
                        htmlFor={selectedType === "ONLINE" ? "meetingLink" : "location"}
                        error={selectedType === "ONLINE" ? errors.meetingLink?.message : errors.location?.message}
                        required
                      >
                        {selectedType === "ONLINE" ? (
                          <Input id="meetingLink" placeholder="https://meet.google.com/..." {...register("meetingLink")} />
                        ) : (
                          <Input id="location" placeholder="Main Hall / Room 04" {...register("location")} />
                        )}
                      </FormField>
                      <div className="field-grid grid-cols-2 gap-4">
                        <FormField label="Capacity" htmlFor="capacity" error={errors.capacity?.message} required>
                          <Input id="capacity" min="1" type="number" {...register("capacity")} />
                        </FormField>
                        <FormField label="Fee" htmlFor="fee" error={errors.fee?.message} required>
                          <Input id="fee" min="0" step="0.01" type="number" {...register("fee")} />
                        </FormField>
                      </div>
                    </div>
                    <FormField label="Notes" htmlFor="notes" error={errors.notes?.message} hint="Optional context for admins, teachers, or support staff.">
                      <Textarea id="notes" placeholder="Add joining notes, curriculum focus, or parent-facing reminders." {...register("notes")} />
                    </FormField>
                  </div>

                  <div className="space-y-4">
                    <div className="subtle-panel p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Assigned students</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {selectedStudentIds.length} selected of capacity {selectedCapacity || 0}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-brand-700 shadow-sm ring-1 ring-border/70">
                          {teachers.find((teacher) => teacher.id === selectedTeacherId)?.name ?? "Teacher"}
                        </div>
                      </div>

                      {errors.studentIds?.message ? <p className="mt-3 text-sm text-rose-600">{errors.studentIds.message}</p> : null}

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {students.map((student) => {
                          const selected = selectedStudentIds.includes(student.id);

                          return (
                            <button
                              key={student.id}
                              className={cn(
                                "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition",
                                selected ? "border-brand-300 bg-brand-50 text-brand-900" : "border-border bg-white hover:border-brand-200 hover:bg-brand-50/50"
                              )}
                              type="button"
                              onClick={() => toggleSelectedStudent(student.id)}
                            >
                              <span
                                className={cn(
                                  "flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold",
                                  selected ? "border-brand-500 bg-brand-600 text-white" : "border-border text-transparent"
                                )}
                              >
                                x
                              </span>
                              <span>
                                <span className="block font-medium text-slate-900">{student.name}</span>
                                <span className="text-xs text-muted-foreground">{student.phone}</span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="subtle-panel p-5">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4 text-brand-600" />
                        {watch("date") ? formatDate(watch("date")) : "Select a date"}
                      </div>
                      <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
                        <Clock3 className="h-4 w-4 text-brand-600" />
                        {formatScheduleDay(watch("scheduleDay"))} - {formatTimeRange(watch("startTime"), watch("endTime"))}
                      </div>
                      <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
                        <Users className="h-4 w-4 text-brand-600" />
                        {selectedStudentIds.length} enrolled students
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button disabled={isPending} type="submit">
                    {isPending ? "Saving..." : editingClassId ? "Save changes" : "Create class"}
                  </Button>
                  {editingClassId ? (
                    <Button variant="outline" type="button" onClick={handleCancelEdit}>
                      Cancel edit
                    </Button>
                  ) : null}
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle>{isAdmin ? "Class roster" : "Upcoming classes"}</CardTitle>
            <CardDescription>
              {isAdmin
                ? "Search, review, and maintain every scheduled class with teacher, capacity, and fee visibility."
                : "Review your assigned sessions, joining links, and teacher details."}
            </CardDescription>
          </div>
          {isAdmin ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-[240px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-10" placeholder="Search classes, subjects, teachers" value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
              <Select className="min-w-[180px]" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "ALL" | ClassStatus)}>
                <option value="ALL">All statuses</option>
                {classStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}
        </CardHeader>
        <CardContent>
          {filteredClasses.length === 0 ? (
            <EmptyState
              title={isAdmin ? "No classes match the current filters" : "No upcoming classes"}
              description={
                isAdmin
                  ? "Try a different keyword or status filter, or create a new class from the form above."
                  : "Scheduled classes will appear here once your teacher assigns them."
              }
            />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Schedule</th>
                    <th>Teacher</th>
                    <th>Students</th>
                    <th>Status</th>
                    <th>Fee</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClasses.map((lesson) => {
                    const statusTone =
                      lesson.status === "ACTIVE"
                        ? "emerald"
                        : lesson.status === "DRAFT"
                          ? "amber"
                          : lesson.status === "CANCELLED"
                            ? "rose"
                            : "sky";

                    return (
                      <tr key={lesson.id}>
                        <td>
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-900">{lesson.title}</p>
                            <p>{lesson.subject} - {lesson.level}</p>
                            {lesson.notes ? <p className="max-w-sm text-xs text-muted-foreground">{lesson.notes}</p> : null}
                          </div>
                        </td>
                        <td>
                          <div className="space-y-1">
                            <p className="inline-flex items-center gap-2 text-slate-900">
                              <CalendarDays className="h-4 w-4 text-brand-600" />
                              {formatDate(lesson.date)}
                            </p>
                            <p className="inline-flex items-center gap-2">
                              <Clock3 className="h-4 w-4 text-brand-600" />
                              {formatScheduleDay(lesson.scheduleDay)} - {formatTimeRange(lesson.startTime, lesson.endTime)}
                            </p>
                            {lesson.meetingLink ? (
                              <Link className="inline-flex items-center gap-2 text-brand-700 hover:text-brand-800" href={lesson.meetingLink} target="_blank">
                                <Link2 className="h-4 w-4" />
                                Join link
                              </Link>
                            ) : lesson.location ? (
                              <span className="inline-flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4 text-brand-600" />
                                {lesson.location}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td>
                          <div>
                            <p className="font-medium text-slate-900">{lesson.teacher.name}</p>
                            <p className="text-xs text-muted-foreground">{lesson.teacher.email || lesson.teacher.phone || "Teacher account"}</p>
                          </div>
                        </td>
                        <td>
                          <div>
                            <p className="font-medium text-slate-900">{lesson.students.length} / {lesson.capacity}</p>
                            <p className="text-xs text-muted-foreground">
                              {lesson.students.length === 0 ? "No students assigned" : lesson.students.map((student) => student.name).join(", ")}
                            </p>
                          </div>
                        </td>
                        <td>
                          <Badge tone={statusTone} value={lesson.status} />
                        </td>
                        <td className="font-medium text-slate-900">{formatCurrency(lesson.fee)}</td>
                        <td>
                          {isAdmin ? (
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" variant="outline" type="button" onClick={() => handleEdit(lesson)}>
                                <SquarePen className="h-4 w-4" />
                                Edit
                              </Button>
                              <Button size="sm" variant="danger" type="button" onClick={() => handleDelete(lesson)}>
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          ) : lesson.meetingLink ? (
                            <Link
                              className="inline-flex h-9 items-center justify-center rounded-2xl bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:bg-brand-700"
                              href={lesson.meetingLink}
                              target="_blank"
                            >
                              Join class
                            </Link>
                          ) : (
                            <span className="text-sm text-muted-foreground">See teacher for venue details</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      {isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Online Enrollment Requests</CardTitle>
            <CardDescription>
              Review requests from the public website, open the uploaded payment slip, and approve the student into the class when ready.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {enrollmentRequests.length === 0 ? (
              <EmptyState title="No online requests yet" description="Enrollment requests will appear here after families request a class and upload the payment slip." />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Class</th>
                      <th>Payment Slip</th>
                      <th>Status</th>
                      <th>Requested</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollmentRequests.map((request) => {
                      const statusTone =
                        request.status === "APPROVED"
                          ? "emerald"
                          : request.status === "REJECTED"
                            ? "rose"
                            : request.status === "PAYMENT_SUBMITTED"
                              ? "sky"
                              : "amber";

                      return (
                        <tr key={request.id}>
                          <td>
                            <div className="space-y-1">
                              <p className="font-semibold text-slate-900">{request.studentName}</p>
                              <p>{request.studentPhone}{request.studentEmail ? ` - ${request.studentEmail}` : ""}</p>
                              <p className="text-xs text-muted-foreground">Parent: {request.parentName}{request.parentContact ? ` - ${request.parentContact}` : ""}</p>
                              {request.grade || request.school || request.learningLevel ? (
                                <p className="text-xs text-muted-foreground">{[request.grade, request.school, request.learningLevel].filter(Boolean).join(" - ")}</p>
                              ) : null}
                              {request.notes ? <p className="max-w-sm text-xs text-muted-foreground">{request.notes}</p> : null}
                            </div>
                          </td>
                          <td>
                            <div className="space-y-1">
                              <p className="font-semibold text-slate-900">{request.className}</p>
                              <p>{request.classSubject} - {request.classLevel}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(request.classDate)} - {formatScheduleDay(request.scheduleDay)} - {formatTimeRange(request.startTime, request.endTime)}</p>
                              <p className="text-xs text-muted-foreground">Fee: {formatCurrency(request.classFee)}</p>
                            </div>
                          </td>
                          <td>
                            {request.paymentSlipUrl ? (
                              <div className="space-y-2">
                                <Link className="inline-flex items-center gap-2 text-brand-700 hover:text-brand-800" href={request.paymentSlipUrl} target="_blank">
                                  <Link2 className="h-4 w-4" />
                                  {request.paymentSlipName ?? "View slip"}
                                </Link>
                                <p className="text-xs text-muted-foreground">Uploaded and ready for review</p>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Waiting for payment slip</span>
                            )}
                          </td>
                          <td>
                            <div className="space-y-2">
                              <Badge tone={statusTone} value={request.status} />
                              {request.reviewNote ? <p className="max-w-xs text-xs text-muted-foreground">{request.reviewNote}</p> : null}
                              {request.approvedStudentId ? <p className="text-xs text-emerald-700">Student account linked</p> : null}
                            </div>
                          </td>
                          <td>{formatDate(request.createdAt)}</td>
                          <td>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                type="button"
                                disabled={isPending || request.status !== "PAYMENT_SUBMITTED"}
                                onClick={() => handleRequestReview(request, "APPROVE")}
                              >
                                Approve
                              </Button>
                              {request.status !== "APPROVED" && request.status !== "REJECTED" ? (
                                <Button
                                  size="sm"
                                  variant="danger"
                                  type="button"
                                  disabled={isPending}
                                  onClick={() => handleRequestReview(request, "REJECT")}
                                >
                                  Reject
                                </Button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}


