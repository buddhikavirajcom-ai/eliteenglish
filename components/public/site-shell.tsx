import type { ReactNode } from "react";
import Link from "next/link";
import { BookOpenCheck, Mail, Phone } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/public/navbar";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/classes", label: "Courses" },
  { href: "/testimonials", label: "Reviews" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" }
] as const;

export async function SiteShell({
  activePath,
  children
}: {
  activePath: string;
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7faff_0%,#ffffff_38%,#f5f8ff_100%)] text-slate-900">
      <Navbar activePath={activePath} isAuthenticated={Boolean(user)} />

      <main>{children}</main>

      <footer className="border-t border-white/80 bg-white/90 backdrop-blur">
        <div className="mx-auto grid w-full max-w-[1240px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-brand-600 p-2.5 text-white shadow-sm">
                <BookOpenCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-slate-950">
                  The Elite English Academy
                </p>
                <p className="text-sm text-slate-500">
                  Warm, modern English coaching for school learners.
                </p>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600">
              A polished education experience for learners and families who want
              structured progress, clear communication, and premium online
              teaching.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Pages
            </p>
            <div className="mt-4 space-y-2.5">
              {footerLinks.map((item) => (
                <Link
                  key={item.href}
                  className="block text-sm text-slate-600 transition hover:text-slate-950"
                  href={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Quick Help
            </p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand-600" />
                Contact details are available on the contact page
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-600" />
                Parents and students can use the portal after enrollment
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
