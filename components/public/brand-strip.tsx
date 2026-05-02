import { partnerBrands } from "@/lib/landing-content";

export function BrandStrip() {
  return (
    <section className="relative z-10 -mt-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1240px] rounded-[2rem] border border-white/80 bg-white/88 px-6 py-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-brand-700">
              Trusted learning experiences
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Designed with the clarity, confidence, and polish that modern
              learners expect from premium digital education brands.
            </p>
          </div>

          <div className="grid flex-1 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {partnerBrands.map((brand) => (
              <div
                key={brand}
                className="flex h-16 items-center justify-center rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 px-4 text-center font-display text-lg font-semibold tracking-[-0.03em] text-slate-500"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
