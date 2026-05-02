import { cn, enumLabel } from "@/lib/utils";

type BadgeTone = "emerald" | "amber" | "sky" | "rose" | "slate";

const toneMap: Record<BadgeTone, string> = {
  emerald: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  sky: "bg-brand-50 text-brand-700 ring-1 ring-brand-100",
  rose: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
  slate: "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
};

export function Badge({ value, tone = "slate" }: { value: string; tone?: BadgeTone }) {
  return <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide", toneMap[tone])}>{enumLabel(value)}</span>;
}

