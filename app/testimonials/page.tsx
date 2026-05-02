import Link from "next/link";
import { SectionHeading } from "@/components/public/section-heading";
import { SiteShell } from "@/components/public/site-shell";
import { TestimonialCard } from "@/components/public/testimonial-card";
import { testimonials } from "@/lib/public-content";

export default function TestimonialsPage() {
  return (
    <SiteShell activePath="/testimonials">
      <section className="mx-auto w-full max-w-[1240px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <SectionHeading
          eyebrow="Testimonials"
          title="Warm words from students and parents"
          description="A personal teacher website should feel trustworthy. These testimonials reinforce the calm, professional experience the site is designed to communicate."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} />
          ))}
        </div>
        <div className="mt-10 rounded-[1.75rem] border border-white/80 bg-[linear-gradient(145deg,#ffffff_0%,#eef4ff_100%)] p-6 shadow-[0_20px_56px_rgba(15,23,42,0.08)]">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-slate-950">Ready to find the right class?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Families can browse the class list first and then reach out with questions about level, schedule, and fit.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/classes" className="inline-flex items-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              View classes
            </Link>
            <Link href="/contact" className="inline-flex items-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
              Contact teacher
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}