import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const quiz = await prisma.quiz.findUnique({
    where: {
      id: params.id
    },
    include: {
      questions: {
        orderBy: {
          createdAt: "asc"
        }
      },
      results: session.user.role === "ADMIN" ? true : { where: { studentId: session.user.studentId ?? "" } }
    }
  });

  if (!quiz || (session.user.role !== "ADMIN" && !quiz.isPublished)) {
    return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
  }

  return NextResponse.json(quiz);
}
