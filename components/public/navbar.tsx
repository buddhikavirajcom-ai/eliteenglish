"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  Menu,
  Search,
  ShoppingCart,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/classes", label: "Courses" },
  { href: "/testimonials", label: "Reviews" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" }
] as const;

export function Navbar({
  activePath,
  isAuthenticated
}: {
  activePath: string;
  isAuthenticated: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const secondaryHref = isAuthenticated ? "/dashboard" : "/login";
  const secondaryLabel = isAuthenticated ? "Dashboard" : "Login";
  const primaryHref = isAuthenticated ? "/dashboard" : "/classes";
  const primaryLabel = isAuthenticated ? "Continue Learning" : "Sign Up";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/92 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          className="flex items-center gap-3"
          href="/"
          onClick={() => setIsOpen(false)}
        >
          <div className="rounded-2xl bg-slate-950 p-2.5 text-white shadow-[0_12px_24px_rgba(15,23,42,0.12)]">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-base font-semibold tracking-[-0.03em] text-slate-950">
              The Elite English Academy
            </p>
            <p className="text-xs text-slate-500">Premium online coaching</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-slate-200/80 bg-white px-2 py-1.5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] lg:flex">
          {navigation.map((item) => {
            const active = activePath === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  active
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/classes"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">Search courses</span>
          </Link>
          <Link
            href="/classes"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="sr-only">View course cart</span>
          </Link>
          <Link
            href={secondaryHref}
            className="text-sm font-semibold text-slate-700 transition hover:text-slate-950"
          >
            {secondaryLabel}
          </Link>
          <Link
            href={primaryHref}
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            {primaryLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 lg:hidden"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-slate-200/80 bg-white lg:hidden">
          <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-3 px-4 py-4 sm:px-6">
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/classes"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700"
                onClick={() => setIsOpen(false)}
              >
                <Search className="h-4 w-4" />
                Search
              </Link>
              <Link
                href="/classes"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700"
                onClick={() => setIsOpen(false)}
              >
                <ShoppingCart className="h-4 w-4" />
                Cart
              </Link>
            </div>

            <nav className="grid gap-1">
              {navigation.map((item) => {
                const active = activePath === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm font-medium transition",
                      active
                        ? "bg-slate-950 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                href={secondaryHref}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800"
                onClick={() => setIsOpen(false)}
              >
                {secondaryLabel}
              </Link>
              <Link
                href={primaryHref}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                onClick={() => setIsOpen(false)}
              >
                {primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
