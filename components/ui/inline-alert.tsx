import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type InlineAlertTone = "success" | "error" | "warning" | "info";

const toneMap: Record<InlineAlertTone, { wrapper: string; icon: typeof Info }> = {
  success: {
    wrapper: "border-emerald-200 bg-emerald-50/90 text-emerald-900",
    icon: CheckCircle2
  },
  error: {
    wrapper: "border-rose-200 bg-rose-50/90 text-rose-900",
    icon: AlertCircle
  },
  warning: {
    wrapper: "border-amber-200 bg-amber-50/90 text-amber-900",
    icon: TriangleAlert
  },
  info: {
    wrapper: "border-brand-200 bg-brand-50/90 text-brand-900",
    icon: Info
  }
};

export function InlineAlert({ tone = "info", title, description, className }: { tone?: InlineAlertTone; title: string; description?: string; className?: string }) {
  const { wrapper, icon: Icon } = toneMap[tone];

  return (
    <div className={cn("rounded-2xl border px-4 py-3", wrapper, className)}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          {description ? <p className="mt-1 text-sm opacity-90">{description}</p> : null}
        </div>
      </div>
    </div>
  );
}

