import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  action
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  action?: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-3 md:flex-row md:items-end md:justify-between", align === "center" && "items-center text-center") }>
      <div className={cn("max-w-2xl", align === "center" && "mx-auto") }>
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-brand-700">{eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-[2rem]">{title}</h2>
        {description ? <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-[15px]">{description}</p> : null}
      </div>
      {action ? <div className={cn("shrink-0", align === "center" && "mt-1")}>{action}</div> : null}
    </div>
  );
}