import { z } from "zod";

const isoDate = z.string().min(1).refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid date.");
const monthString = z.string().regex(/^\d{4}-\d{2}$/, "Choose a valid month.");
const timeString = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter a valid time.");
const optionalString = z
  .union([z.string(), z.undefined(), z.null()])
  .transform((value) => value?.trim() || undefined);
const optionalEmail = z
  .union([z.string().trim().email("Enter a valid email address."), z.literal(""), z.undefined(), z.null()])
  .transform((value) => value || undefined);
const optionalUrl = z
  .union([z.string().trim().url("Enter a valid URL."), z.literal(""), z.undefined(), z.null()])
  .transform((value) => value || undefined);
const optionalInteger = z
  .union([z.coerce.number().int().min(0), z.nan(), z.literal(""), z.undefined(), z.null()])
  .transform((value) => (typeof value === "number" && !Number.isNaN(value) ? value : undefined));

export const loginSchema = z.object({
  identifier: z.string().trim().min(2, "Enter your email or phone number."),
  password: z.string().min(6, "Password must be at least 6 characters.")
});

export const createStudentSchema = z.object({
  name: z.string().trim().min(2, "Student name is required."),
  phone: z.string().trim().min(7, "Phone number is required."),
  email: optionalEmail,
  parentName: z.string().trim().min(2, "Parent name is required."),
  parentContact: optionalString,
  grade: optionalString,
  school: optionalString,
  learningLevel: optionalString,
  notes: optionalString,
  password: z.string().min(6, "Password must be at least 6 characters.")
});

export const updateStudentSchema = createStudentSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters.").optional().or(z.literal(""))
});

export const attendanceSchema = z.object({
  studentId: z.string().min(1, "Student is required."),
  date: isoDate,
  status: z.enum(["PRESENT", "ABSENT"])
});

export const qrScanSchema = z.object({
  qrCode: z.string().trim().min(5, "QR code is required."),
  date: isoDate.optional()
});

export const paymentSchema = z.object({
  studentId: z.string().min(1, "Student is required."),
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  type: z.enum(["MONTHLY", "CLASS"]),
  method: z.enum(["CASH", "ONLINE"]),
  status: z.enum(["PAID", "PENDING"]),
  date: isoDate
});

export const publicEnrollmentRequestSchema = z.object({
  studentName: z.string().trim().min(2, "Student name is required."),
  studentPhone: z.string().trim().min(7, "Student phone is required."),
  studentEmail: optionalEmail,
  parentName: z.string().trim().min(2, "Parent name is required."),
  parentContact: optionalString,
  grade: optionalString,
  school: optionalString,
  learningLevel: optionalString,
  notes: optionalString
});

export const enrollmentRequestReviewSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  reviewNote: optionalString
});

export const classSchema = z
  .object({
    title: z.string().trim().min(2, "Class name is required."),
    subject: z.string().trim().min(2, "Subject is required."),
    teacherId: z.string().min(1, "Teacher is required."),
    level: z.string().trim().min(2, "Level is required."),
    type: z.enum(["ONLINE", "OFFLINE"]),
    status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"]),
    date: isoDate,
    scheduleDay: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
    startTime: timeString,
    endTime: timeString,
    meetingLink: optionalUrl,
    location: optionalString,
    capacity: z.coerce.number().int("Capacity must be a whole number.").min(1, "Capacity must be at least 1."),
    fee: z.coerce.number().min(0, "Fee cannot be negative."),
    notes: optionalString,
    studentIds: z.array(z.string()).default([])
  })
  .superRefine((value, ctx) => {
    if (value.type === "ONLINE" && !value.meetingLink) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["meetingLink"],
        message: "Online classes require a meeting link."
      });
    }

    if (value.type === "OFFLINE" && !value.location) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["location"],
        message: "Offline classes require a location."
      });
    }

    if (value.endTime <= value.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End time must be later than the start time."
      });
    }

    if (value.studentIds.length > value.capacity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["capacity"],
        message: "Capacity cannot be lower than the assigned student count."
      });
    }
  });

export const progressSchema = z.object({
  studentId: z.string().min(1, "Student is required."),
  month: monthString,
  listening: z.coerce.number().int().min(1).max(5),
  reading: z.coerce.number().int().min(1).max(5),
  writing: z.coerce.number().int().min(1).max(5),
  speaking: z.coerce.number().int().min(1).max(5),
  comment: optionalString,
  testMark: z
    .union([z.coerce.number().int().min(0).max(100), z.nan(), z.undefined(), z.null()])
    .transform((value) => (typeof value === "number" && !Number.isNaN(value) ? value : undefined))
});

export const homeworkCreateSchema = z.object({
  classId: z.string().min(1, "Class is required."),
  title: z.string().trim().min(2, "Homework title is required."),
  description: optionalString,
  deadline: isoDate
});

export const homeworkReviewSchema = z
  .object({
    feedback: optionalString,
    score: optionalInteger,
    maxScore: optionalInteger,
    status: z.enum(["PENDING", "SUBMITTED", "REVIEWED"]).optional()
  })
  .superRefine((value, ctx) => {
    if (value.score !== undefined && value.maxScore !== undefined && value.score > value.maxScore) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["score"],
        message: "Score cannot be higher than the maximum score."
      });
    }
  });

export const materialSchema = z.object({
  title: z.string().trim().min(2, "Material title is required."),
  category: z.enum(["WORKSHEET", "STORY", "VIDEO"]),
  description: optionalString
});

export const announcementSchema = z.object({
  title: z.string().trim().min(2, "Title is required."),
  message: z.string().trim().min(4, "Message is required.")
});

export const quizSchema = z.object({
  title: z.string().trim().min(2, "Quiz title is required."),
  description: z.string().trim().optional(),
  questions: z
    .array(
      z
        .object({
          prompt: z.string().trim().min(5, "Question text is required."),
          options: z.array(z.string().trim().min(1, "Option cannot be empty.")).min(2, "Add at least 2 options."),
          correctAnswer: z.coerce.number().int().min(0)
        })
        .superRefine((question, ctx) => {
          if (question.correctAnswer >= question.options.length) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["correctAnswer"],
              message: "Correct answer must match one of the options."
            });
          }
        })
    )
    .min(1, "At least one question is required.")
});

export const quizSubmissionSchema = z.object({
  answers: z.array(z.coerce.number().int().min(0)).min(1, "Select answers before submitting.")
});

export type ClassFormValues = z.input<typeof classSchema>;
export type ParsedClassFormValues = z.output<typeof classSchema>;
export type PublicEnrollmentRequestFormValues = z.input<typeof publicEnrollmentRequestSchema>;
export type ParsedPublicEnrollmentRequestFormValues = z.output<typeof publicEnrollmentRequestSchema>;
export type EnrollmentRequestReviewFormValues = z.input<typeof enrollmentRequestReviewSchema>;
export type ParsedEnrollmentRequestReviewFormValues = z.output<typeof enrollmentRequestReviewSchema>;
export type ProgressFormValues = z.input<typeof progressSchema>;
