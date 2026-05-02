import { type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ParsedClassFormValues } from "@/lib/validators";

export const classInclude = {
  teacher: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true
    }
  },
  enrollments: {
    include: {
      student: true
    }
  }
} satisfies Prisma.ClassInclude;

export function dateOnly(value: string) {
  return new Date(`${value}T00:00:00`);
}

export async function validateClassReferences(values: Pick<ParsedClassFormValues, "teacherId" | "studentIds">) {
  const teacher = await prisma.user.findFirst({
    where: {
      id: values.teacherId,
      role: "ADMIN"
    },
    select: {
      id: true
    }
  });

  if (!teacher) {
    return {
      error: "Selected teacher could not be found.",
      fieldErrors: {
        teacherId: ["Select a valid teacher account."]
      }
    };
  }

  if (values.studentIds.length === 0) {
    return null;
  }

  const studentCount = await prisma.student.count({
    where: {
      id: {
        in: values.studentIds
      }
    }
  });

  if (studentCount !== values.studentIds.length) {
    return {
      error: "One or more selected students could not be found.",
      fieldErrors: {
        studentIds: ["Refresh the page and reselect the assigned students."]
      }
    };
  }

  return null;
}

export function createClassData(values: ParsedClassFormValues, createdById: string): Prisma.ClassCreateInput {
  return {
    title: values.title,
    subject: values.subject,
    level: values.level,
    type: values.type,
    status: values.status,
    date: dateOnly(values.date),
    scheduleDay: values.scheduleDay,
    time: values.startTime,
    endTime: values.endTime,
    link: values.type === "ONLINE" ? values.meetingLink : null,
    location: values.type === "OFFLINE" ? values.location ?? null : null,
    capacity: values.capacity,
    fee: values.fee,
    notes: values.notes ?? null,
    teacher: {
      connect: {
        id: values.teacherId
      }
    },
    createdBy: {
      connect: {
        id: createdById
      }
    },
    enrollments: values.studentIds.length
      ? {
          createMany: {
            data: values.studentIds.map((studentId) => ({
              studentId
            }))
          }
        }
      : undefined
  };
}

export function updateClassData(values: ParsedClassFormValues): Prisma.ClassUpdateInput {
  return {
    title: values.title,
    subject: values.subject,
    level: values.level,
    type: values.type,
    status: values.status,
    date: dateOnly(values.date),
    scheduleDay: values.scheduleDay,
    time: values.startTime,
    endTime: values.endTime,
    link: values.type === "ONLINE" ? values.meetingLink : null,
    location: values.type === "OFFLINE" ? values.location ?? null : null,
    capacity: values.capacity,
    fee: values.fee,
    notes: values.notes ?? null,
    teacher: {
      connect: {
        id: values.teacherId
      }
    },
    enrollments: {
      deleteMany: {},
      ...(values.studentIds.length
        ? {
            createMany: {
              data: values.studentIds.map((studentId) => ({
                studentId
              }))
            }
          }
        : {})
    }
  };
}


