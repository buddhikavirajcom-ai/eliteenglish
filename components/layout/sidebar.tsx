"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeDollarSign,
  BookOpenCheck,
  CalendarDays,
  ClipboardCheck,
  FolderOpen,
  Home,
  LineChart,
  MessageSquareText,
  PenSquare,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/lms";

const teacherItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/students", label: "Students", icon: Users },
  { href: "/dashboard/classes", label: "Classes", icon: CalendarDays },
  { href: "/dashboard/attendance", label: "Attendance", icon: ClipboardCheck },
  { href: "/dashboard/homework", label: "Homework", icon: BookOpenCheck },
  { href: "/dashboard/quizzes", label: "Quizzes", icon: PenSquare },
  { href: "/dashboard/progress", label: "Progress", icon: LineChart },
  { href: "/dashboard/payments", label: "Payments", icon: BadgeDollarSign },
  { href: "/dashboard/materials", label: "Materials", icon: FolderOpen },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquareText },
];

const parentItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/classes", label: "Classes", icon: CalendarDays },
  { href: "/dashboard/homework", label: "Homework", icon: BookOpenCheck },
  { href: "/dashboard/quizzes", label: "Quizzes", icon: PenSquare },
  { href: "/dashboard/progress", label: "Progress", icon: LineChart },
  { href: "/dashboard/attendance", label: "Attendance", icon: ClipboardCheck },
  { href: "/dashboard/payments", label: "Payments", icon: BadgeDollarSign },
  { href: "/dashboard/materials", label: "Materials", icon: FolderOpen },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquareText },
];

export function Sidebar({ role, name }: { role: UserRole; name: string }) {
  const pathname = usePathname();
  const items = role === "ADMIN" ? teacherItems : parentItems;

  return (
    <aside className="border-b border-white/10 bg-slate-950/95 px-5 py-6 text-white backdrop-blur md:sticky md:top-0 md:min-h-screen md:border-b-0 md:border-r md:border-r-white/10">
      <div className="mb-8 rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-brand-600/30 via-brand-700/10 to-slate-900 p-5 shadow-lg shadow-black/10">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 p-3 text-white ring-1 ring-white/10">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold tracking-[-0.02em]">
              The Elite English Academy
            </p>
            <p className="text-sm text-slate-300">
              {role === "ADMIN" ? "Teacher Workspace" : "Parent Portal"}
            </p>
          </div>
        </div>
        <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Signed In
          </p>
          <p className="mt-2 font-medium text-white">{name}</p>
        </div>
      </div>

      <nav className="grid gap-2 md:block">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition duration-200",
                active
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-300 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition",
                  active
                    ? "text-brand-700"
                    : "text-slate-400 group-hover:text-white",
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
