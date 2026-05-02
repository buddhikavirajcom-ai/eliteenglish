"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, DollarSign, ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { apiRequest } from "@/lib/api-client";
import { formatCurrency, formatDate, toPlainDate } from "@/lib/utils";
import type { PaymentItem, StudentOption } from "@/types/lms";

export function PaymentManager({
  students,
  payments,
  isAdmin,
  unpaidStudents,
  summary
}: {
  students: StudentOption[];
  payments: PaymentItem[];
  isAdmin: boolean;
  unpaidStudents: StudentOption[];
  summary: {
    paid: number;
    pending: number;
  };
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    studentId: students[0]?.id ?? "",
    amount: "",
    type: "MONTHLY",
    method: "CASH",
    status: "PAID",
    date: toPlainDate(new Date())
  });
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        await apiRequest("/api/payments", {
          method: "POST",
          body: JSON.stringify(form)
        });
        setForm({
          studentId: students[0]?.id ?? "",
          amount: "",
          type: "MONTHLY",
          method: "CASH",
          status: "PAID",
          date: toPlainDate(new Date())
        });
        setMessage("Payment saved successfully.");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to save payment.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between py-6">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Paid Total</p>
              <p className="mt-3 font-display text-3xl font-semibold text-emerald-700">{formatCurrency(summary.paid)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between py-6">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Pending Total</p>
              <p className="mt-3 font-display text-3xl font-semibold text-amber-700">{formatCurrency(summary.pending)}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-amber-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between py-6">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Transactions</p>
              <p className="mt-3 font-display text-3xl font-semibold text-slate-900">{payments.length}</p>
            </div>
            <ReceiptText className="h-8 w-8 text-brand-600" />
          </CardContent>
        </Card>
      </div>

      {message ? <div className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-800">{message}</div> : null}

      {isAdmin ? (
        <div className="section-grid">
          <Card>
            <CardHeader>
              <CardTitle>Record Payment</CardTitle>
              <CardDescription>Track monthly or per-class payments with status and method.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <Select value={form.studentId} onChange={(event) => setForm((current) => ({ ...current, studentId: event.target.value }))}>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </Select>
                <div className="field-grid">
                  <Input
                    min="0"
                    placeholder="Amount"
                    step="0.01"
                    type="number"
                    value={form.amount}
                    onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                  />
                  <Input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
                  <Select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}>
                    <option value="MONTHLY">Monthly</option>
                    <option value="CLASS">Class</option>
                  </Select>
                  <Select value={form.method} onChange={(event) => setForm((current) => ({ ...current, method: event.target.value }))}>
                    <option value="CASH">Cash</option>
                    <option value="ONLINE">Online</option>
                  </Select>
                  <Select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                    <option value="PAID">Paid</option>
                    <option value="PENDING">Pending</option>
                  </Select>
                </div>
                <Button disabled={isPending} type="submit">
                  Save payment
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Unpaid Students</CardTitle>
              <CardDescription>Students without a paid record for the current month.</CardDescription>
            </CardHeader>
            <CardContent>
              {unpaidStudents.length === 0 ? (
                <EmptyState title="Everyone is up to date" description="No unpaid students detected for the current month." />
              ) : (
                <div className="space-y-3">
                  {unpaidStudents.map((student) => (
                    <div key={student.id} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                      <p className="font-semibold text-amber-900">{student.name}</p>
                      <p className="text-sm text-amber-800">{student.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{isAdmin ? "Payment History" : "My Payment History"}</CardTitle>
          <CardDescription>{isAdmin ? "All recorded payment transactions." : "Your payment ledger and statuses."}</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <EmptyState title="No payments yet" description="Payments will appear here after they are created." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="font-medium text-slate-900">{payment.studentName}</td>
                      <td>{formatCurrency(payment.amount)}</td>
                      <td>{payment.type.toLowerCase()}</td>
                      <td>{payment.method.toLowerCase()}</td>
                      <td>
                        <Badge value={payment.status} tone={payment.status === "PAID" ? "emerald" : "amber"} />
                      </td>
                      <td>{formatDate(payment.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
