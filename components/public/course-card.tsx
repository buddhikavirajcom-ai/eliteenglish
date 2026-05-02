import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  ShoppingCart,
  Users
} from "lucide-react";
import type { FeaturedCourse } from "@/lib/landing-content";
import { Card } from "@/components/ui/card";

export function CourseCard({ course }: { course: FeaturedCourse }) {
  return (
    <Card className="group overflow-hidden rounded-[1.9rem] border border-white/80 bg-white/96 p-0 shadow-[0_20px_56px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_72px_rgba(15,23,42,0.12)]">
      <div className="relative aspect-[16/11] overflow-hidden">
        <Image
          src={course.image}
          alt={course.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/42 via-slate-950/10 to-transparent" />
        <div className="absolute left-4 top-4 inline-flex rounded-full border border-white/35 bg-white/18 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
          {course.category}
        </div>
        <div className="absolute right-4 top-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
          {course.level}
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <div className="inline-flex items-center gap-2">
            <Users className="h-4 w-4 text-brand-600" />
            {course.students}
          </div>
          <div className="inline-flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-brand-600" />
            {course.duration}
          </div>
        </div>

        <div>
          <h3 className="font-display text-[1.35rem] font-semibold tracking-[-0.04em] text-slate-950">
            {course.title}
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {course.description}
          </p>
        </div>

        <div className="flex items-end justify-between gap-4 border-t border-slate-100 pt-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Starting at
            </p>
            <p className="mt-1 font-display text-3xl font-semibold tracking-[-0.05em] text-slate-950">
              {course.price}
              <span className="ml-1 text-base font-medium text-slate-500">
                /course
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/classes"
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              View Course
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              aria-label={`Add ${course.title} to cart`}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
