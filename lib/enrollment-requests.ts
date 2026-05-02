import bcrypt from "bcryptjs";
import { type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ParsedEnrollmentRequestReviewFormValues, ParsedPublicEnrollmentRequestFormValues } from "@/lib/validators";

export const enrollmentRequestInclude = {
  class: {
    select: {
      id: true,
      title: true,
      subject: true,
      level: true,
      fee: true,
      date: true,
      scheduleDay: true,
      time: true,
      endTime: true,
      capacity: true,
      status: true,
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      }
    }
  },
  payment: true
} satisfies Prisma.ClassEnrollmentRequestInclude;

function createQrCode(name: string) {
  return `LMS-${name.replace(/\s+/g, "-").toUpperCase()}-${crypto.randomUUID().slice(0, 8)}`;
}

function normalizeEmail(value?: string | null) {
  return value?.toLowerCase() ?? undefined;
}

function todayDateOnly() {
  const value = new Date();
  value.setHours(0, 0, 0, 0);
  return value;
}

export async function validatePublicEnrollmentRequest(classId: string, studentPhone: string) {
  const lesson = await prisma.class.findFirst({
    where: {
      id: classId,
      status: "ACTIVE"
    },
    include: {
      enrollments: {
        select: {
          id: true
        }
      }
    }
  });

  if (!lesson) {
    return {
      error: "This class is no longer available for enrollment."
    };
  }

  if (lesson.enrollments.length >= lesson.capacity) {
    return {
      error: "This class is currently full. Please contact the teacher for the next opening."
    };
  }

  const duplicateRequest = await prisma.classEnrollmentRequest.findFirst({
    where: {
      classId,
      studentPhone,
      status: {
        in: ["REQUESTED", "PAYMENT_SUBMITTED", "APPROVED"]
      }
    }
  });

  if (duplicateRequest) {
    return {
      error:
        duplicateRequest.status === "APPROVED"
          ? "This phone number already has an approved enrollment for the class."
          : "An enrollment request for this phone number is already in progress for the class."
    };
  }

  return null;
}

export function createEnrollmentRequestData(classId: string, values: ParsedPublicEnrollmentRequestFormValues): Prisma.ClassEnrollmentRequestCreateInput {
  return {
    studentName: values.studentName,
    studentPhone: values.studentPhone,
    studentEmail: normalizeEmail(values.studentEmail),
    parentName: values.parentName,
    parentContact: values.parentContact ?? null,
    grade: values.grade ?? null,
    school: values.school ?? null,
    learningLevel: values.learningLevel ?? null,
    notes: values.notes ?? null,
    class: {
      connect: {
        id: classId
      }
    }
  };
}

type ReviewEnrollmentResult =
  | {
      error: string;
      status: number;
    }
  | {
      request: Prisma.ClassEnrollmentRequestGetPayload<{ include: typeof enrollmentRequestInclude }>;
      studentCreated: boolean;
      studentName: string;
      status: number;
    };

export async function reviewEnrollmentRequest(id: string, values: ParsedEnrollmentRequestReviewFormValues): Promise<ReviewEnrollmentResult> {
  const request = await prisma.classEnrollmentRequest.findUnique({
    where: {
      id
    },
    include: enrollmentRequestInclude
  });

  if (!request) {
    return {
      error: "Enrollment request not found.",
      status: 404
    };
  }

  if (values.action === "REJECT") {
    if (request.status === "APPROVED") {
      return {
        error: "Approved requests cannot be rejected from this screen.",
        status: 400
      };
    }

    const updated = await prisma.classEnrollmentRequest.update({
      where: {
        id
      },
      data: {
        status: "REJECTED",
        reviewNote: values.reviewNote ?? null,
        reviewedAt: new Date()
      },
      include: enrollmentRequestInclude
    });

    return {
      request: updated,
      studentCreated: false,
      studentName: request.studentName,
      status: 200
    };
  }

  if (request.status === "APPROVED") {
    return {
      error: "This request has already been approved.",
      status: 400
    };
  }

  if (request.status !== "PAYMENT_SUBMITTED") {
    return {
      error: "The payment slip must be uploaded before approval.",
      status: 400
    };
  }

  return prisma.$transaction(async (tx) => {
    const lesson = await tx.class.findUnique({
      where: {
        id: request.classId
      },
      include: {
        enrollments: {
          select: {
            studentId: true
          }
        }
      }
    });

    if (!lesson || lesson.status !== "ACTIVE") {
      return {
        error: "This class is no longer active.",
        status: 400
      };
    }

    const normalizedEmail = normalizeEmail(request.studentEmail);
    const existingStudent = await tx.student.findUnique({
      where: {
        phone: request.studentPhone
      }
    });

    let studentId = existingStudent?.id ?? null;
    let studentName = existingStudent?.name ?? request.studentName;
    let studentCreated = false;

    if (!studentId) {
      const duplicateUser = await tx.user.findFirst({
        where: {
          OR: [
            { phone: request.studentPhone },
            ...(normalizedEmail ? [{ email: normalizedEmail }] : [])
          ]
        }
      });

      if (duplicateUser) {
        return {
          error:
            normalizedEmail && duplicateUser.email === normalizedEmail
              ? "This email already belongs to another account. Please review the request manually."
              : "This phone number already belongs to another account. Please review the request manually.",
          status: 409
        };
      }
    }

    const alreadyEnrolled = studentId
      ? lesson.enrollments.some((enrollment) => enrollment.studentId === studentId)
      : false;

    if (!alreadyEnrolled && lesson.enrollments.length >= lesson.capacity) {
      return {
        error: "This class is full, so the request cannot be approved right now.",
        status: 400
      };
    }

    if (!studentId) {
      const passwordHash = await bcrypt.hash(`${crypto.randomUUID()}-${Date.now()}`, 10);
      const user = await tx.user.create({
        data: {
          name: request.studentName,
          email: normalizedEmail,
          phone: request.studentPhone,
          passwordHash,
          role: "STUDENT"
        }
      });

      const student = await tx.student.create({
        data: {
          name: request.studentName,
          phone: request.studentPhone,
          parentName: request.parentName,
          parentContact: request.parentContact,
          grade: request.grade,
          school: request.school,
          learningLevel: request.learningLevel,
          notes: request.notes,
          qrCode: createQrCode(request.studentName),
          userId: user.id
        }
      });

      studentId = student.id;
      studentName = student.name;
      studentCreated = true;
    }

    if (!alreadyEnrolled) {
      await tx.classEnrollment.create({
        data: {
          classId: request.classId,
          studentId
        }
      });
    }

    if (!request.payment) {
      await tx.payment.create({
        data: {
          studentId,
          enrollmentRequestId: request.id,
          amount: lesson.fee,
          type: "CLASS",
          method: "ONLINE",
          status: "PAID",
          date: todayDateOnly()
        }
      });
    }

    const updated = await tx.classEnrollmentRequest.update({
      where: {
        id: request.id
      },
      data: {
        status: "APPROVED",
        reviewNote: values.reviewNote ?? null,
        reviewedAt: new Date(),
        approvedAt: new Date(),
        approvedStudentId: studentId
      },
      include: enrollmentRequestInclude
    });

    return {
      request: updated,
      studentCreated,
      studentName,
      status: 200
    };
  });
}