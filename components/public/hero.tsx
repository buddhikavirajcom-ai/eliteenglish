import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  PlayCircle,
  Search,
  Sparkles,
  Star,
  Users
} from "lucide-react";
import { heroHighlights, heroMetrics } from "@/lib/landing-content";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#163cbd_0%,#2463eb_36%,#5b5ce8_68%,#7a3ff2_100%)] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.16),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.14),transparent_28%)]" />
      <div className="absolute -left-20 top-24 h-56 w-56 rounded-full border border-white/10 bg-white/10 blur-3xl" />
      <div className="absolute right-0 top-10 h-72 w-72 rounded-full border border-white/10 bg-fuchsia-300/10 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-[1240px] gap-12 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-24 lg:pt-16">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 shadow-[0_12px_30px_rgba(8,15,52,0.18)] backdrop-blur">
            <Sparkles className="h-4 w-4 text-amber-300" />
            Premium online learning for ambitious students
          </div>

          <h1 className="mt-7 max-w-3xl font-display text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl lg:text-[4.4rem] lg:leading-[1.02]">
            Build confidence faster with live coaching, smarter classes, and a premium LMS experience.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
            Launch a modern education brand with polished course discovery,
            structured online coaching, and a learning experience families can
            trust from the very first click.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/classes"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_rgba(8,15,52,0.22)] transition hover:-translate-y-0.5"
            >
              Explore Courses
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/16"
            >
              Book a Consultation
              <PlayCircle className="h-4 w-4" />
            </Link>
          </div>

          <form
            action="/classes"
            className="mt-8 flex flex-col gap-3 rounded-[1.75rem] border border-white/20 bg-white/10 p-3 shadow-[0_20px_50px_rgba(8,15,52,0.18)] backdrop-blur sm:flex-row"
          >
            <div className="flex flex-1 items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 text-slate-900">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="query"
                placeholder="Search live speaking classes, exam prep, writing labs..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              Find a Course
            </button>
          </form>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {heroMetrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-[1.5rem] border border-white/16 bg-white/10 px-4 py-4 shadow-[0_14px_36px_rgba(8,15,52,0.14)] backdrop-blur"
              >
                <p className="font-display text-3xl font-semibold tracking-[-0.05em] text-white">
                  {metric.value}
                </p>
                <p className="mt-1 text-sm text-white/72">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-center lg:justify-end">
          <div className="relative w-full max-w-[560px]">
            <div className="animate-float-slow absolute -left-6 top-8 hidden h-28 w-28 rounded-[2rem] border border-white/20 bg-white/10 backdrop-blur lg:block" />
            <div className="animate-float-delayed absolute right-0 top-0 hidden h-24 w-24 rounded-full border border-white/20 bg-amber-300/20 blur-[2px] lg:block" />
            <div className="absolute left-10 top-16 hidden h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl lg:block" />

            <div className="relative mx-auto max-w-[520px] rounded-[2.4rem] border border-white/18 bg-white/10 p-4 shadow-[0_34px_80px_rgba(8,15,52,0.28)] backdrop-blur-xl">
              <div className="absolute -left-10 top-24 hidden h-24 w-24 rotate-12 rounded-[2rem] border border-white/18 bg-white/8 lg:block" />
              <div className="absolute -right-8 bottom-16 hidden h-20 w-20 -rotate-12 rounded-[1.5rem] border border-white/18 bg-fuchsia-300/20 lg:block" />

              <div className="relative overflow-hidden rounded-[2rem] bg-white/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_22%),linear-gradient(180deg,rgba(15,23,42,0)_30%,rgba(15,23,42,0.34)_100%)]" />
                <Image
                  src="/teacher/teacher.jpeg"
                  alt="Confident learner in a premium online coaching session"
                  width={720}
                  height={860}
                  className="h-[540px] w-full object-cover object-center"
                  priority
                />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <div className="rounded-[1.5rem] border border-white/14 bg-slate-950/48 p-4 backdrop-blur">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">
                      Live coaching experience
                    </p>
                    <p className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-white">
                      Guided classes that feel personal, modern, and outcome-focused.
                    </p>
                  </div>
                </div>
              </div>

              <div className="animate-rise-in absolute -left-3 bottom-10 rounded-[1.5rem] border border-white/18 bg-white/92 p-4 text-slate-950 shadow-[0_20px_40px_rgba(8,15,52,0.18)] backdrop-blur sm:-left-10">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-brand-50 p-2.5 text-brand-700">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Enrolled learners
                    </p>
                    <p className="mt-1 text-lg font-semibold">1.8k+ active students</p>
                  </div>
                </div>
              </div>

              <div className="animate-rise-in absolute -right-2 top-10 rounded-[1.5rem] border border-white/20 bg-slate-950/78 p-4 text-white shadow-[0_20px_40px_rgba(8,15,52,0.24)] backdrop-blur sm:-right-8">
                <div className="flex items-center gap-2 text-amber-300">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                </div>
                <p className="mt-2 text-lg font-semibold">4.9 family rating</p>
                <p className="mt-1 text-sm text-white/72">
                  Trusted for structure, support, and polished delivery
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {heroHighlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-[1.4rem] border border-white/14 bg-white/10 px-4 py-4 shadow-[0_14px_30px_rgba(8,15,52,0.14)] backdrop-blur"
                  >
                    <div className="inline-flex rounded-2xl bg-white/14 p-2.5 text-white">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-white">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm text-white/68">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
