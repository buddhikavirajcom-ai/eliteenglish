import { addDays, getDay, subDays } from "date-fns";
import bcrypt from "bcryptjs";
import {
  AttendanceStatus,
  ClassStatus,
  ClassType,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  PrismaClient,
  ScheduleDay,
  UserRole
} from "@prisma/client";

const prisma = new PrismaClient();

function createQrCode(name: string) {
  return `LMS-${name.replace(/\s+/g, "-").toUpperCase()}-${crypto.randomUUID().slice(0, 8)}`;
}

function scheduleDayFromDate(value: Date): ScheduleDay {
  const day = getDay(value);
  const days: ScheduleDay[] = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  return days[day];
}

async function main() {
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const studentPasswordHash = await bcrypt.hash("student123", 10);

  await prisma.result.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.classEnrollment.deleteMany();
  await prisma.class.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      name: "Apoorwa Teacher",
      email: "admin@lms.local",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN
    }
  });

  const seededStudents = await Promise.all(
    [
      { name: "Nethmi Perera", phone: "0771234567", parentName: "Amila Perera" },
      { name: "Dinuka Silva", phone: "0712345678", parentName: "Tharindu Silva" },
      { name: "Sethmi Fernando", phone: "0765551122", parentName: "Kumari Fernando" },
      { name: "Yenuli Jayasuriya", phone: "0759004400", parentName: "Sampath Jayasuriya" }
    ].map(async (student) => {
      const user = await prisma.user.create({
        data: {
          name: student.name,
          phone: student.phone,
          passwordHash: studentPasswordHash,
          role: UserRole.STUDENT
        }
      });

      return prisma.student.create({
        data: {
          ...student,
          qrCode: createQrCode(student.name),
          userId: user.id
        }
      });
    })
  );

  await prisma.attendance.createMany({
    data: [
      { studentId: seededStudents[0].id, date: subDays(new Date(), 2), status: AttendanceStatus.PRESENT },
      { studentId: seededStudents[1].id, date: subDays(new Date(), 2), status: AttendanceStatus.ABSENT },
      { studentId: seededStudents[2].id, date: subDays(new Date(), 1), status: AttendanceStatus.PRESENT },
      { studentId: seededStudents[3].id, date: new Date(), status: AttendanceStatus.PRESENT }
    ]
  });

  await prisma.payment.createMany({
    data: [
      {
        studentId: seededStudents[0].id,
        amount: 3500,
        type: PaymentType.MONTHLY,
        method: PaymentMethod.CASH,
        status: PaymentStatus.PAID,
        date: subDays(new Date(), 4)
      },
      {
        studentId: seededStudents[1].id,
        amount: 3500,
        type: PaymentType.MONTHLY,
        method: PaymentMethod.ONLINE,
        status: PaymentStatus.PENDING,
        date: subDays(new Date(), 1)
      },
      {
        studentId: seededStudents[2].id,
        amount: 2000,
        type: PaymentType.CLASS,
        method: PaymentMethod.CASH,
        status: PaymentStatus.PAID,
        date: new Date()
      }
    ]
  });

  const algebraDate = addDays(new Date(), 1);
  const physicsDate = addDays(new Date(), 3);

  const createdClasses = await Promise.all([
    prisma.class.create({
      data: {
        title: "Advanced Algebra",
        subject: "Mathematics",
        level: "Grade 10",
        type: ClassType.OFFLINE,
        status: ClassStatus.ACTIVE,
        date: algebraDate,
        scheduleDay: scheduleDayFromDate(algebraDate),
        time: "09:00",
        endTime: "10:30",
        location: "Hall A",
        capacity: 24,
        fee: 3500,
        notes: "Focus on simultaneous equations and weekly revision drills.",
        teacherId: admin.id,
        createdById: admin.id
      }
    }),
    prisma.class.create({
      data: {
        title: "Physics Revision Live",
        subject: "Physics",
        level: "A/L Revision",
        type: ClassType.ONLINE,
        status: ClassStatus.ACTIVE,
        date: physicsDate,
        scheduleDay: scheduleDayFromDate(physicsDate),
        time: "18:30",
        endTime: "20:00",
        link: "https://meet.google.com/example-live-room",
        capacity: 40,
        fee: 2000,
        notes: "Recorded link shared after class for enrolled students.",
        teacherId: admin.id,
        createdById: admin.id
      }
    })
  ]);

  await prisma.classEnrollment.createMany({
    data: [
      { classId: createdClasses[0].id, studentId: seededStudents[0].id },
      { classId: createdClasses[0].id, studentId: seededStudents[1].id },
      { classId: createdClasses[1].id, studentId: seededStudents[2].id },
      { classId: createdClasses[1].id, studentId: seededStudents[3].id }
    ]
  });

  const quiz = await prisma.quiz.create({
    data: {
      title: "Fractions Mastery Quiz",
      description: "Quick checkpoint for fractions, ratios, and simplification.",
      createdById: admin.id,
      questions: {
        create: [
          {
            prompt: "Which fraction is equivalent to 3/4?",
            options: ["6/8", "4/10", "9/16", "12/20"],
            correctAnswer: 0
          },
          {
            prompt: "What is 1/2 + 1/4?",
            options: ["2/4", "3/4", "1/8", "4/8"],
            correctAnswer: 1
          },
          {
            prompt: "Simplify 8/12.",
            options: ["2/3", "4/5", "3/4", "5/6"],
            correctAnswer: 0
          }
        ]
      }
    },
    include: {
      questions: true
    }
  });

  await prisma.result.create({
    data: {
      quizId: quiz.id,
      studentId: seededStudents[0].id,
      answers: [0, 1, 0],
      score: 3,
      totalQuestions: quiz.questions.length
    }
  });

  console.log("Seed complete.");
  console.log("Admin login: admin@lms.local / admin123");
  console.log("Student login: 0771234567 / student123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

