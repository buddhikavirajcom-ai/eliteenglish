import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { qrScanSchema } from "@/lib/validators";

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
    const parsed = qrScanSchema.pick({ qrCode: true }).safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload." }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: {
        qrCode: parsed.data.qrCode
      }
    });

    if (!student) {
      return NextResponse.json({ error: "QR code not recognized." }, { status: 404 });
    }

    return NextResponse.json({
      id: student.id,
      name: student.name,
      phone: student.phone,
      qrCode: student.qrCode
    });
  } catch {
    return NextResponse.json({ error: "Unable to validate QR code." }, { status: 500 });
  }
}
