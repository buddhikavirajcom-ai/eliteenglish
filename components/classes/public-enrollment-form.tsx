"use client";

import { type FormEvent, useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { BadgeCheck, CreditCard, FileUp, Hourglass, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiRequest } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { publicEnrollmentRequestSchema, type PublicEnrollmentRequestFormValues } from "@/lib/validators";

type EnrollmentResponse = {
  message: string;
  request: {
    id: string;
  };
};

function createDefaultValues(): PublicEnrollmentRequestFormValues {
  return {
    studentName: "",
    studentPhone: "",
    studentEmail: "",
    parentName: "",
    parentContact: "",
    grade: "",
    school: "",
    learningLevel: "",
    notes: ""
  };
}

export function PublicEnrollmentForm({
  classId,
  classTitle,
  classFee
}: {
  classId: string;
  classTitle: string;
  classFee: number;
}) {
  const [requestId, setRequestId] = useState<string | null>(null);
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [paymentSlipError, setPaymentSlipError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error" | "info"; title: string; description?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors }
  } = useForm<PublicEnrollmentRequestFormValues>({
    resolver: zodResolver(publicEnrollmentRequestSchema),
    defaultValues: createDefaultValues()
  });

  const step = useMemo(() => {
    if (!requestId) {
      return 1;
    }

    if (classFee > 0 && !paymentSubmitted) {
      return 2;
    }

    return 3;
  }, [classFee, paymentSubmitted, requestId]);

  const submitRequest = handleSubmit((values) => {
    setFeedback(null);

    startTransition(async () => {
      try {
        const response = await apiRequest<EnrollmentResponse>(`/api/public/classes/${classId}/enroll`, {
          method: "POST",
          body: JSON.stringify(values)
        });

        setRequestId(response.request.id);
        setPaymentSubmitted(false);
        setFeedback({
          tone: "success",
          title: "Enrollment request sent.",
          description:
            classFee > 0
              ? "Now upload the payment slip so the teacher can review and approve the class request."
              : "The request is now waiting for teacher approval."
        });

        if (classFee <= 0) {
          reset(createDefaultValues());
        }
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.fieldErrors) {
            Object.entries(error.fieldErrors).forEach(([field, messages]) => {
              if (!messages?.[0]) {
                return;
              }

              setError(field as keyof PublicEnrollmentRequestFormValues, {
                message: messages[0]
              });
            });
          }

          setError("root", {
            message: error.message
          });
          setFeedback({ tone: "error", title: error.message });
          return;
        }

        setFeedback({ tone: "error", title: "Unable to submit the enrollment request." });
      }
    });
  });

  const uploadPaymentSlip = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPaymentSlipError(null);
    setFeedback(null);

    if (!requestId) {
      setPaymentSlipError("Submit the enrollment request first.");
      return;
    }

    if (!paymentSlip) {
      setPaymentSlipError("Choose the payment slip before uploading.");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("paymentSlip", paymentSlip);

        await apiRequest(`/api/public/enrollment-requests/${requestId}/payment-slip`, {
          method: "POST",
          body: formData
        });

        setPaymentSubmitted(true);
        setFeedback({
          tone: "success",
          title: "Payment slip uploaded successfully.",
          description: "The teacher can now review the payment and approve the request."
        });
        reset(createDefaultValues());
        setPaymentSlip(null);
      } catch (error) {
        setPaymentSlipError(error instanceof Error ? error.message : "Unable to upload the payment slip.");
      }
    });
  };

  const requestDone = Boolean(requestId) && classFee <= 0;
  const slipDone = Boolean(requestId) && classFee > 0 && paymentSubmitted;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            number: 1,
            title: "Send request",
            icon: FileUp,
            active: step === 1,
            complete: Boolean(requestId)
          },
          {
            number: 2,
            title: classFee > 0 ? "Upload slip" : "Await review",
            icon: CreditCard,
            active: step === 2,
            complete: classFee > 0 ? slipDone : requestDone
          },
          {
            number: 3,
            title: "Teacher approval",
            icon: Hourglass,
            active: step === 3,
            complete: requestDone || slipDone
          }
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.number}
              className={`rounded-[1.5rem] border px-4 py-4 ${item.complete ? "border-emerald-200 bg-emerald-50/80" : item.active ? "border-brand-200 bg-brand-50/70" : "border-white/80 bg-white/85"}`}
            >
              <div className="flex items-center gap-3">
                <div className={`rounded-2xl p-2.5 ${item.complete ? "bg-emerald-100 text-emerald-700" : item.active ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Step {item.number}</p>
                  <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {feedback ? <InlineAlert tone={feedback.tone} title={feedback.title} description={feedback.description} /> : null}

      {!requestId ? (
        <form className="space-y-5" onSubmit={submitRequest}>
          {errors.root?.message ? <InlineAlert tone="error" title={errors.root.message} /> : null}

          <div className="field-grid">
            <FormField label="Student name" htmlFor="studentName" error={errors.studentName?.message} required>
              <Input id="studentName" placeholder="Student full name" {...register("studentName")} />
            </FormField>
            <FormField label="Student phone" htmlFor="studentPhone" error={errors.studentPhone?.message} required>
              <Input id="studentPhone" placeholder="07X XXX XXXX" {...register("studentPhone")} />
            </FormField>
            <FormField label="Student email" htmlFor="studentEmail" error={errors.studentEmail?.message}>
              <Input id="studentEmail" placeholder="student@example.com" {...register("studentEmail")} />
            </FormField>
            <FormField label="Parent / guardian name" htmlFor="parentName" error={errors.parentName?.message} required>
              <Input id="parentName" placeholder="Parent full name" {...register("parentName")} />
            </FormField>
            <FormField label="Parent contact" htmlFor="parentContact" error={errors.parentContact?.message}>
              <Input id="parentContact" placeholder="Parent phone or WhatsApp" {...register("parentContact")} />
            </FormField>
            <FormField label="Grade / class" htmlFor="grade" error={errors.grade?.message}>
              <Input id="grade" placeholder="Grade 8" {...register("grade")} />
            </FormField>
            <FormField label="School" htmlFor="school" error={errors.school?.message}>
              <Input id="school" placeholder="Current school" {...register("school")} />
            </FormField>
            <FormField label="Learning level" htmlFor="learningLevel" error={errors.learningLevel?.message}>
              <Input id="learningLevel" placeholder="Beginner / Intermediate" {...register("learningLevel")} />
            </FormField>
          </div>

          <FormField label="Notes" htmlFor="notes" error={errors.notes?.message} hint="Optional details for the teacher, such as goals or preferred contact times.">
            <Textarea id="notes" placeholder={`Anything the teacher should know before reviewing ${classTitle}?`} {...register("notes")} />
          </FormField>

          <Button disabled={isPending} type="submit">
            {isPending ? "Sending request..." : "Request enrollment"}
          </Button>
        </form>
      ) : classFee > 0 && !paymentSubmitted ? (
        <form className="space-y-5" onSubmit={uploadPaymentSlip}>
          <div className="rounded-[1.75rem] border border-brand-200 bg-brand-50/70 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-white p-3 text-brand-700 shadow-sm">
                <UploadCloud className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">Upload the payment slip for {classTitle}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Amount to pay: <span className="font-semibold text-slate-950">{formatCurrency(classFee)}</span>. After the slip is uploaded, the teacher can approve the request and add the student to the class.
                </p>
              </div>
            </div>
          </div>

          <FormField
            label="Payment slip"
            htmlFor="paymentSlip"
            error={paymentSlipError ?? undefined}
            hint="Upload an image or PDF of the bank transfer or payment receipt."
            required
          >
            <input
              id="paymentSlip"
              accept="image/*,.pdf"
              className="block w-full rounded-2xl border border-input bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-700 focus:border-brand-400 focus:ring-4 focus:ring-brand-100/70"
              type="file"
              onChange={(event) => {
                const nextFile = event.target.files?.[0] ?? null;
                setPaymentSlip(nextFile);
                setPaymentSlipError(null);
              }}
            />
          </FormField>

          <div className="flex flex-wrap gap-3">
            <Button disabled={isPending} type="submit">
              {isPending ? "Uploading..." : "Upload payment slip"}
            </Button>
            <Link
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              href="/contact"
            >
              Ask a question first
            </Link>
          </div>
        </form>
      ) : (
        <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50/80 p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-white p-3 text-emerald-700 shadow-sm">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">
                {classFee > 0 ? "Request and payment submitted" : "Request sent successfully"}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                The request is waiting for teacher approval. You can use the contact page if you need help before approval is completed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}