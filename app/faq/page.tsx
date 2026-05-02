import Link from "next/link";
import { FaqList } from "@/components/public/faq-list";
import { SectionHeading } from "@/components/public/section-heading";
import { SiteShell } from "@/components/public/site-shell";
import { faqs } from "@/lib/public-content";

export default function FaqPage() {
  return (
    <SiteShell activePath="/faq">
      <section className="mx-auto w-full max-w-[1040px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <SectionHeading
          eyebrow="FAQ"
          title="Simple answers for students and parents"
          description="The public site keeps this information easy to find so families can make a confident decision without hunting through unnecessary pages."
          align="center"
        />
        <div className="mt-8">
          <FaqList items={faqs} />
        </div>
        <div className="mt-10 rounded-[1.75rem] border border-white/80 bg-white/90 p-6 text-center shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-slate-950">Still have a question?</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            The contact page is open to everyone, so you can reach out before creating any portal account.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/contact" className="inline-flex items-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Contact teacher
            </Link>
            <Link href="/classes" className="inline-flex items-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
              View classes
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}