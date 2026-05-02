"use client";

import { type FormEvent, useState, useTransition } from "react";
import { Download, FolderKanban } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { MaterialItem } from "@/types/lms";

export function MaterialLibrary({ materials, isAdmin }: { materials: MaterialItem[]; isAdmin: boolean }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; title: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await apiRequest("/api/materials", {
          method: "POST",
          body: formData
        });
        event.currentTarget.reset();
        setFeedback({ tone: "success", title: "Material uploaded successfully." });
        router.refresh();
      } catch (error) {
        setFeedback({ tone: "error", title: error instanceof Error ? error.message : "Unable to upload material." });
      }
    });
  };

  return (
    <div className="space-y-6">
      {feedback ? <InlineAlert tone={feedback.tone} title={feedback.title} /> : null}

      {isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Upload Material</CardTitle>
            <CardDescription>Keep the library tidy with simple categories that parents understand.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="field-grid">
                <FormField label="Title" htmlFor="title" required>
                  <Input id="title" name="title" placeholder="Past tense worksheet" required />
                </FormField>
                <FormField label="Category" htmlFor="category" required>
                  <Select id="category" name="category" defaultValue="WORKSHEET" required>
                    <option value="WORKSHEET">Worksheet</option>
                    <option value="STORY">Story</option>
                    <option value="VIDEO">Video</option>
                  </Select>
                </FormField>
              </div>
              <div className="field-grid">
                <FormField label="Description" htmlFor="description">
                  <Textarea id="description" name="description" placeholder="Optional note for parents or students." />
                </FormField>
                <FormField label="File" htmlFor="file" required>
                  <Input id="file" name="file" type="file" required />
                </FormField>
              </div>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Uploading..." : "Upload material"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Materials Library</CardTitle>
          <CardDescription>Worksheets, stories, and videos in one easy place.</CardDescription>
        </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
            <EmptyState title="No materials yet" description="Uploaded learning resources will show up here." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {materials.map((material) => (
                <div key={material.id} className="rounded-[1.75rem] border border-border/80 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-3 rounded-2xl bg-brand-50 p-3 text-brand-700">
                        <FolderKanban className="h-5 w-5" />
                      </div>
                      <h3 className="font-display text-xl font-semibold text-slate-950">{material.title}</h3>
                    </div>
                    <Badge value={material.category} tone="sky" />
                  </div>
                  {material.description ? <p className="mt-3 text-sm leading-6 text-slate-700">{material.description}</p> : null}
                  <p className="mt-4 text-sm text-muted-foreground">Added {formatDate(material.createdAt)}</p>
                  <a
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
                    href={material.fileUrl}
                    target="_blank"
                  >
                    <Download className="h-4 w-4" />
                    {material.fileName}
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}