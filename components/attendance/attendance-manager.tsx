"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { QrCode, ScanLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { apiRequest } from "@/lib/api-client";
import { formatDate, toPlainDate } from "@/lib/utils";
import type { AttendanceItem, StudentOption } from "@/types/lms";

export function AttendanceManager({
  students,
  records,
  isAdmin
}: {
  students: StudentOption[];
  records: AttendanceItem[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [manualForm, setManualForm] = useState({
    studentId: students[0]?.id ?? "",
    date: toPlainDate(new Date()),
    status: "PRESENT"
  });
  const [scanForm, setScanForm] = useState({
    qrCode: "",
    date: toPlainDate(new Date())
  });
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const presentCount = records.filter((record) => record.status === "PRESENT").length;

  const submitManual = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        await apiRequest("/api/attendance", {
          method: "POST",
          body: JSON.stringify(manualForm)
        });
        setMessage("Attendance saved successfully.");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to save attendance.");
      }
    });
  };

  const submitScan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        const response = await apiRequest<{ message: string }>("/api/attendance/scan", {
          method: "POST",
          body: JSON.stringify(scanForm)
        });
        setScanForm((current) => ({ ...current, qrCode: "" }));
        setMessage(response.message);
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to scan QR code.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="py-6">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total Records</p>
            <p className="mt-3 font-display text-3xl font-semibold text-slate-950">{records.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Present</p>
            <p className="mt-3 font-display text-3xl font-semibold text-emerald-700">{presentCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Absent</p>
            <p className="mt-3 font-display text-3xl font-semibold text-rose-700">{records.length - presentCount}</p>
          </CardContent>
        </Card>
      </div>

      {message ? <div className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-800">{message}</div> : null}

      {isAdmin ? (
        <div className="section-grid">
          <Card>
            <CardHeader>
              <CardTitle>Manual Marking</CardTitle>
              <CardDescription>Select a student and save attendance for a specific day.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={submitManual}>
                <Select
                  value={manualForm.studentId}
                  onChange={(event) => setManualForm((current) => ({ ...current, studentId: event.target.value }))}
                >
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </Select>
                <div className="field-grid">
                  <Input
                    type="date"
                    value={manualForm.date}
                    onChange={(event) => setManualForm((current) => ({ ...current, date: event.target.value }))}
                  />
                  <Select value={manualForm.status} onChange={(event) => setManualForm((current) => ({ ...current, status: event.target.value }))}>
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                  </Select>
                </div>
                <Button disabled={isPending} type="submit">
                  Save attendance
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>QR Scan Simulation</CardTitle>
              <CardDescription>Paste a student QR string to mark them present instantly.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={submitScan}>
                <Input
                  value={scanForm.qrCode}
                  onChange={(event) => setScanForm((current) => ({ ...current, qrCode: event.target.value }))}
                  placeholder="Paste QR code string"
                  required
                />
                <Input
                  type="date"
                  value={scanForm.date}
                  onChange={(event) => setScanForm((current) => ({ ...current, date: event.target.value }))}
                />
                <Button className="gap-2" disabled={isPending} type="submit">
                  <ScanLine className="h-4 w-4" />
                  Scan and mark present
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{isAdmin ? "Attendance History" : "My Attendance History"}</CardTitle>
          <CardDescription>{isAdmin ? "Chronological attendance records for all students." : "Your recent attendance records."}</CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <EmptyState title="No attendance records" description="Attendance entries will appear here after they are saved." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Date</th>
                    <th>Status</th>
                    {isAdmin ? <th>Recorded</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td className="font-medium text-slate-900">{record.studentName}</td>
                      <td>{formatDate(record.date)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <QrCode className="h-4 w-4 text-slate-400" />
                          <Badge value={record.status} tone={record.status === "PRESENT" ? "emerald" : "rose"} />
                        </div>
                      </td>
                      {isAdmin ? <td>{formatDate(record.createdAt, "dd MMM yyyy, hh:mm a")}</td> : null}
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
