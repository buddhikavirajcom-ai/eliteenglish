import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="flex items-center gap-1 text-sm font-semibold text-slate-800" htmlFor={htmlFor}>
        <span>{label}</span>
        {required ? <span className="text-rose-600">*</span> : null}
      </label>
      {children}
      {error ? <p className="text-sm text-rose-600">{error}</p> : hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

