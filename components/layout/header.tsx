"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header({ title, subtitle, description }: { title: string; subtitle: string; description?: string }) {
  return (
    <div className="mb-8 flex flex-col gap-5 border-b border-border/80 pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        <p className="section-heading">{subtitle}</p>
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">{title}</h1>
          {description ? <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">{description}</p> : null}
        </div>
      </div>
      <Button variant="outline" className="gap-2 self-start lg:self-auto" onClick={() => signOut({ callbackUrl: "/login" })}>
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}

