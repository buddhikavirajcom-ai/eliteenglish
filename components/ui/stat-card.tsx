import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatCard({
  title,
  value,
  hint,
  icon: Icon
}: {
  title: string;
  value: string;
  hint: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="relative overflow-hidden p-0">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-brand-400 to-accent-400" />
      <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-brand-100/70 blur-3xl" />
      <div className="relative flex items-start justify-between gap-4 p-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
          <h3 className="mt-4 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground">{value}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{hint}</p>
        </div>
        <div className="rounded-2xl bg-brand-50 p-3 text-brand-700 shadow-sm ring-1 ring-brand-100">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}

