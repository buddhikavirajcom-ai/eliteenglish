import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { reviewEnrollmentRequest } from "@/lib/enrollment-requests";
import { enrollmentRequestReviewSchema } from "@/lib/validators";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return unauthorized();
  }

  if (session.user.role !== "ADMIN") {
    return forbidden();
  }

  try {
    const body = await request.json();
    const parsed = enrollmentRequestReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid review request.",
          fieldErrors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const result = await reviewEnrollmentRequest(params.id, parsed.data);

    if (!('request' in result)) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      message:
        parsed.data.action === "APPROVE"
          ? result.studentCreated
            ? `Request approved. ${result.studentName} was added to the class and a student account was created.`
            : `Request approved. ${result.studentName} was added to the class.`
          : "Enrollment request rejected.",
      request: result.request
    });
  } catch {
    return NextResponse.json({ error: "Unable to review the enrollment request." }, { status: 500 });
  }
}