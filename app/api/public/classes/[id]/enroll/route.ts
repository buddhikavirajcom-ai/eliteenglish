import { NextResponse } from "next/server";
import { createEnrollmentRequestData, enrollmentRequestInclude, validatePublicEnrollmentRequest } from "@/lib/enrollment-requests";
import { prisma } from "@/lib/prisma";
import { publicEnrollmentRequestSchema } from "@/lib/validators";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const parsed = publicEnrollmentRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid enrollment request.",
          fieldErrors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const validationError = await validatePublicEnrollmentRequest(params.id, parsed.data.studentPhone);

    if (validationError) {
      return NextResponse.json(validationError, { status: 409 });
    }

    const enrollmentRequest = await prisma.classEnrollmentRequest.create({
      data: createEnrollmentRequestData(params.id, parsed.data),
      include: enrollmentRequestInclude
    });

    return NextResponse.json(
      {
        message: "Enrollment request submitted successfully.",
        request: enrollmentRequest
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Unable to submit the enrollment request." }, { status: 500 });
  }
}