import { Header } from "@/components/layout/header";
import { PaymentManager } from "@/components/payments/payment-manager";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { PaymentItem, StudentOption } from "@/types/lms";

export default async function PaymentsPage() {
  const user = await requireAuth();

  if (user.role === "ADMIN") {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [students, payments, paidSummary, pendingSummary, studentsWithMonthlyPaid] = await Promise.all([
      prisma.student.findMany({
        orderBy: {
          name: "asc"
        }
      }),
      prisma.payment.findMany({
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        include: {
          student: true
        }
      }),
      prisma.payment.aggregate({
        _sum: {
          amount: true
        },
        where: {
          status: "PAID"
        }
      }),
      prisma.payment.aggregate({
        _sum: {
          amount: true
        },
        where: {
          status: "PENDING"
        }
      }),
      prisma.student.findMany({
        include: {
          payments: {
            where: {
              date: {
                gte: monthStart
              },
              status: "PAID"
            }
          }
        }
      })
    ]);

    const studentOptions: StudentOption[] = students.map((student) => ({
      id: student.id,
      name: student.name,
      phone: student.phone,
      qrCode: student.qrCode
    }));

    const paymentItems: PaymentItem[] = payments.map((payment) => ({
      id: payment.id,
      studentId: payment.studentId,
      studentName: payment.student.name,
      amount: Number(payment.amount),
      type: payment.type,
      method: payment.method,
      status: payment.status,
      date: payment.date.toISOString()
    }));

    const unpaidStudents: StudentOption[] = studentsWithMonthlyPaid
      .filter((student) => student.payments.length === 0)
      .map((student) => ({
        id: student.id,
        name: student.name,
        phone: student.phone,
        qrCode: student.qrCode
      }));

    return (
      <div className="space-y-8">
        <Header
          title="Payments"
          subtitle="Admin"
          description="Record transactions, surface overdue accounts, and keep paid and pending balances easy to review."
        />
        <PaymentManager
          isAdmin
          payments={paymentItems}
          students={studentOptions}
          unpaidStudents={unpaidStudents}
          summary={{
            paid: Number(paidSummary._sum.amount ?? 0),
            pending: Number(pendingSummary._sum.amount ?? 0)
          }}
        />
      </div>
    );
  }

  const payments = await prisma.payment.findMany({
    where: {
      studentId: user.studentId ?? ""
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: {
      student: true
    }
  });

  const paymentItems: PaymentItem[] = payments.map((payment) => ({
    id: payment.id,
    studentId: payment.studentId,
    studentName: payment.student.name,
    amount: Number(payment.amount),
    type: payment.type,
    method: payment.method,
    status: payment.status,
    date: payment.date.toISOString()
  }));

  return (
    <div className="space-y-8">
      <Header
        title="My Payments"
        subtitle="Student"
        description="Review paid and pending balances with clearer transaction history and status visibility."
      />
      <PaymentManager
        isAdmin={false}
        payments={paymentItems}
        students={[]}
        unpaidStudents={[]}
        summary={{
          paid: paymentItems.filter((payment) => payment.status === "PAID").reduce((sum, payment) => sum + payment.amount, 0),
          pending: paymentItems.filter((payment) => payment.status === "PENDING").reduce((sum, payment) => sum + payment.amount, 0)
        }}
      />
    </div>
  );
}

