import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { featuredCourses } from "@/lib/landing-content";
import { CourseCard } from "@/components/public/course-card";

export function FeaturedCourses() {
  return (
    <section className="mx-auto w-full max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-brand-700">
          Featured courses
        </p>
        <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-[2.4rem]">
          Popular online programs built for real progress, not just content delivery.
        </h2>
        <p className="mt-4 text-[15px] leading-8 text-slate-600 sm:text-base">
          From live speaking labs to structured exam preparation, each course is
          designed with strong outcomes, clear pacing, and a premium learner
          journey.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {featuredCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          href="/classes"
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:bg-slate-50"
        >
          View All Courses
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
