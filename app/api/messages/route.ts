import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { announcementSchema } from "@/lib/validators";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return unauthorized();
  }

  const announcements = await prisma.announcement.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });

  return NextResponse.json(announcements);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return unauthorized();
  }

  if (session.user.role !== "ADMIN") {
    return forbidden();
  }

  try {
    const body = await request.json();
    const parsed = announcementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid payload.",
          fieldErrors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: parsed.data.title,
        message: parsed.data.message,
        createdById: session.user.id
      }
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to send announcement." }, { status: 500 });
  }
}