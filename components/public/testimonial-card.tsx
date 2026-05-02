import { Quote } from "lucide-react";
import type { PublicTestimonial } from "@/lib/public-content";
import { Card } from "@/components/ui/card";

export function TestimonialCard({ testimonial }: { testimonial: PublicTestimonial }) {
  return (
    <Card className="rounded-[1.75rem] border border-white/80 bg-white/95 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">{testimonial.name}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{testimonial.role}</p>
        </div>
        <div className="rounded-2xl bg-brand-50 p-2.5 text-brand-700">
          <Quote className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-700">&ldquo;{testimonial.quote}&rdquo;</p>
      <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-3.5 py-3 text-sm text-emerald-800">
        <span className="font-semibold">Result:</span> {testimonial.result}
      </div>
    </Card>
  );
}