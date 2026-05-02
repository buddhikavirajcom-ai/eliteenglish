import { NextResponse } from "next/server";
import { enrollmentRequestInclude } from "@/lib/enrollment-requests";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/uploads";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const enrollmentRequest = await prisma.classEnrollmentRequest.findUnique({
      where: {
        id: params.id
      }
    });

    if (!enrollmentRequest) {
      return NextResponse.json({ error: "Enrollment request not found." }, { status: 404 });
    }

    if (enrollmentRequest.status === "APPROVED" || enrollmentRequest.status === "REJECTED") {
      return NextResponse.json({ error: "This request can no longer be updated." }, { status: 400 });
    }

    const formData = await request.formData();
    const paymentSlip = formData.get("paymentSlip");

    if (!(paymentSlip instanceof File) || paymentSlip.size === 0) {
      return NextResponse.json({ error: "Upload a payment slip before sending for review.", fieldErrors: { paymentSlip: ["Choose a file."] } }, { status: 400 });
    }

    const uploaded = await saveUploadedFile(paymentSlip, "enrollment-payment-slips");

    const updated = await prisma.classEnrollmentRequest.update({
      where: {
        id: params.id
      },
      data: {
        paymentSlipName: uploaded.fileName,
        paymentSlipUrl: uploaded.url,
        status: "PAYMENT_SUBMITTED"
      },
      include: enrollmentRequestInclude
    });

    return NextResponse.json({
      message: "Payment slip uploaded successfully. The teacher can review the request now.",
      request: updated
    });
  } catch {
    return NextResponse.json({ error: "Unable to upload the payment slip." }, { status: 500 });
  }
}