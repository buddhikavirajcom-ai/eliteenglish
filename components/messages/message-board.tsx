"use client";

import { type FormEvent, useState, useTransition } from "react";
import { Megaphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { AnnouncementItem } from "@/types/lms";

export function MessageBoard({ messages, isAdmin }: { messages: AnnouncementItem[]; isAdmin: boolean }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; title: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      title: String(formData.get("title") ?? ""),
      message: String(formData.get("message") ?? "")
    };

    startTransition(async () => {
      try {
        await apiRequest("/api/messages", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        event.currentTarget.reset();
        setFeedback({ tone: "success", title: "Announcement sent." });
        router.refresh();
      } catch (error) {
        setFeedback({ tone: "error", title: error instanceof Error ? error.message : "Unable to send announcement." });
      }
    });
  };

  return (
    <div className="space-y-6">
      {feedback ? <InlineAlert tone={feedback.tone} title={feedback.title} /> : null}

      {isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Send Announcement</CardTitle>
            <CardDescription>Keep parent communication calm and clear with simple one-way updates.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <FormField label="Title" htmlFor="title" required>
                <Input id="title" name="title" placeholder="Holiday schedule update" required />
              </FormField>
              <FormField label="Message" htmlFor="message" required>
                <Textarea id="message" name="message" placeholder="Share the update parents need to know." required />
              </FormField>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Sending..." : "Send update"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{isAdmin ? "Recent Announcements" : "Messages"}</CardTitle>
          <CardDescription>{isAdmin ? "Your latest updates to families." : "Teacher updates for parents."}</CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <EmptyState title="No messages yet" description="Announcements will show up here once the teacher posts one." />
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="rounded-[1.75rem] border border-border/80 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                      <Megaphone className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <div>
                        <h3 className="font-display text-xl font-semibold text-slate-950">{message.title}</h3>
                        <p className="text-sm text-muted-foreground">{formatDate(message.createdAt)}</p>
                      </div>
                      <p className="text-sm leading-6 text-slate-700">{message.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}