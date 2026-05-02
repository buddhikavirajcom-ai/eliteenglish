import { ChevronDown } from "lucide-react";
import type { PublicFaqItem } from "@/lib/public-content";

export function FaqList({ items }: { items: PublicFaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details
          key={item.question}
          className="group rounded-[1.5rem] border border-white/80 bg-white/95 px-5 py-4 shadow-[0_14px_36px_rgba(15,23,42,0.06)]"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-semibold text-slate-950">
            <span>{item.question}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" />
          </summary>
          <p className="pt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}