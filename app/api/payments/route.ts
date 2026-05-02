import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { paymentSchema } from "@/lib/validators";

function dateOnly(value: string) {
  return new Date(`${value}T00:00:00`);
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payments = await prisma.payment.findMany({
    where: session.user.role === "ADMIN" ? undefined : { studentId: session.user.studentId ?? "" },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: {
      student: true
    }
  });

  return NextResponse.json(payments);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = paymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload." }, { status: 400 });
    }

    const payment = await prisma.payment.create({
      data: {
        studentId: parsed.data.studentId,
        amount: parsed.data.amount,
        type: parsed.data.type,
        method: parsed.data.method,
        status: parsed.data.status,
        date: dateOnly(parsed.data.date)
      }
    });

    return NextResponse.json(payment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to save payment." }, { status: 500 });
  }
}
