import { type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ScheduleDay } from "@/types/lms";

export type PublicTeacherProfile = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  activeClassCount: number;
  totalStudents: number;
  subjects: string[];
  levels: string[];
};

export type PublicClassRecord = {
  id: string;
  title: string;
  subject: string;
  level: string;
  type: string;
  scheduleDay: ScheduleDay;
  date: string;
  startTime: string;
  endTime: string;
  fee: number;
  capacity: number;
  seatsTaken: number;
  location: string | null;
  teacherName: string;
  notes?: string | null;
};

export type PublicClassDetail = PublicClassRecord & {
  teacherEmail: string | null;
  teacherPhone: string | null;
};

export async function getPublicTeacherProfile(): Promise<PublicTeacherProfile | null> {
  const teacher = await prisma.user.findFirst({
    where: {
      role: "ADMIN"
    },
    orderBy: {
      createdAt: "asc"
    },
    include: {
      assignedClasses: {
        where: {
          status: "ACTIVE"
        },
        include: {
          enrollments: true
        },
        orderBy: [{ date: "asc" }, { time: "asc" }]
      }
    }
  });

  if (!teacher) {
    return null;
  }

  const subjects = Array.from(new Set(teacher.assignedClasses.map((lesson) => lesson.subject))).filter(Boolean);
  const levels = Array.from(new Set(teacher.assignedClasses.map((lesson) => lesson.level))).filter(Boolean);
  const totalStudents = teacher.assignedClasses.reduce((sum, lesson) => sum + lesson.enrollments.length, 0);

  return {
    id: teacher.id,
    name: teacher.name,
    email: teacher.email,
    phone: teacher.phone,
    activeClassCount: teacher.assignedClasses.length,
    totalStudents,
    subjects,
    levels
  };
}

function mapPublicClass(lesson: {
  id: string;
  title: string;
  subject: string;
  level: string;
  type: string;
  scheduleDay: ScheduleDay;
  date: Date;
  time: string;
  endTime: string;
  fee: Prisma.Decimal | number;
  capacity: number;
  location: string | null;
  notes: string | null;
  teacher: {
    name: string;
    email: string | null;
    phone: string | null;
  };
  enrollments: { id: string }[];
}): PublicClassDetail {
  return {
    id: lesson.id,
    title: lesson.title,
    subject: lesson.subject,
    level: lesson.level,
    type: lesson.type,
    scheduleDay: lesson.scheduleDay,
    date: lesson.date.toISOString(),
    startTime: lesson.time,
    endTime: lesson.endTime,
    fee: Number(lesson.fee),
    capacity: lesson.capacity,
    seatsTaken: lesson.enrollments.length,
    location: lesson.location,
    teacherName: lesson.teacher.name,
    teacherEmail: lesson.teacher.email,
    teacherPhone: lesson.teacher.phone,
    notes: lesson.notes
  };
}

export async function getPublicClasses(): Promise<PublicClassRecord[]> {
  const classes = await prisma.class.findMany({
    where: {
      status: "ACTIVE"
    },
    orderBy: [{ date: "asc" }, { time: "asc" }],
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      },
      enrollments: {
        select: {
          id: true
        }
      }
    }
  });

  return classes.map((lesson) => mapPublicClass(lesson));
}

export async function getPublicClassById(id: string): Promise<PublicClassDetail | null> {
  const lesson = await prisma.class.findFirst({
    where: {
      id,
      status: "ACTIVE"
    },
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      },
      enrollments: {
        select: {
          id: true
        }
      }
    }
  });

  if (!lesson) {
    return null;
  }

  return mapPublicClass(lesson);
}